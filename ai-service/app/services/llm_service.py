import os
import json
import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator
from openai import OpenAI, AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    """
    Centralized LLM service focused on NVIDIA NIM API:
    - Model: openai/gpt-oss-120b
    - Features: Reasoning content capture, streaming support, and robust retries.
    """

    def __init__(self):
        self.nvidia_api_key = os.getenv("NVIDIA_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.mistral_api_key = os.getenv("MISTRAL_API_KEY")
        self.provider = os.getenv("LLM_PROVIDER", "nvidia").lower()
        
        # Base URLs
        self.nvidia_base_url = "https://integrate.api.nvidia.com/v1"
        self.openai_base_url = "https://api.openai.com/v1"
        self.mistral_base_url = "https://api.mistral.ai/v1"
        
        # Models
        self.nvidia_model = os.getenv("NVIDIA_MODEL", "qwen/qwen3-coder-480b-a35b-instruct")
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o")
        self.mistral_model = os.getenv("MISTRAL_MODEL", "mistral-small-latest")
        
        # Select active parameters
        if self.provider == "openai" and self.openai_api_key:
            self.api_key = self.openai_api_key
            self.base_url = self.openai_base_url
            self.model = self.openai_model
        elif self.provider == "mistral" and self.mistral_api_key:
            self.api_key = self.mistral_api_key
            self.base_url = self.mistral_base_url
            self.model = self.mistral_model
        else:
            self.api_key = self.nvidia_api_key
            self.base_url = self.nvidia_base_url
            self.model = self.nvidia_model
            self.provider = "nvidia" # fallback
        
        print(f"[LLM] (i) Initialized with {self.provider.upper()} ({self.model})")

        if not self.api_key:
            print(f"[LLM] [!] CRITICAL: {self.provider.upper()}_API_KEY is missing! AI features will fail.")

        # Initialize clients
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )
        self.async_client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    async def chat_async(self, messages: List[Dict[str, str]], format: Optional[str] = None, options: Dict[str, Any] = {}, override_api_key: Optional[str] = None):
        """Invoke LLM API with automatic provider detection if key is overridden."""
        active_key = override_api_key or self.api_key
        
        if not active_key:
            return {"message": {"content": "Error: AI Strategy Key not configured. Please add it in Sarah AI Settings."}}

        # Default to current instance settings
        active_base_url = self.base_url
        active_model = self.model
        active_provider = self.provider

        # Auto-detect provider if key was overridden
        if override_api_key:
            if override_api_key.startswith("nvapi-"):
                active_provider = "nvidia"
                active_base_url = self.nvidia_base_url
                active_model = self.nvidia_model
            elif override_api_key.startswith("mistral-"):
                active_provider = "mistral"
                active_base_url = self.mistral_base_url
                active_model = self.mistral_model
            elif override_api_key.startswith("sk-"):
                active_provider = "openai"
                active_base_url = self.openai_base_url
                active_model = self.openai_model
            
        # Initialize temporary client for the request
        active_client = AsyncOpenAI(api_key=active_key, base_url=active_base_url)

        if format == "json":
            if messages and messages[-1]["role"] == "user":
                if "json" not in messages[-1]["content"].lower():
                    messages[-1]["content"] += "\n\nCRITICAL: Respond with valid JSON only."

        try:
            # Construct payload
            payload = {
                "model": active_model,
                "messages": messages,
                "max_tokens": options.get("max_tokens", 4096),
                "temperature": options.get("temperature", 1.0),
                "top_p": options.get("top_p", 1.0),
                "stream": False
            }

            # Add NVIDIA-specific reasoning effort if applicable
            if active_provider == "nvidia":
                payload["extra_body"] = {"reasoning_effort": options.get("reasoning_effort", "medium")} if options.get("reasoning_effort") else {}

            response = await active_client.chat.completions.create(**payload)
            
            message = response.choices[0].message
            content = message.content
            reasoning = getattr(message, "reasoning_content", None)

            return {
                "model": active_model,
                "message": {
                    "role": "assistant", 
                    "content": content,
                    "reasoning": reasoning
                },
                "provider": active_provider
            }
        except Exception as e:
            print(f"[LLM] [x] {active_provider.upper()} Async API Call Failed: {e}")
            raise e

    async def stream_chat_async(self, messages: List[Dict[str, str]], options: Dict[str, Any] = {}, override_api_key: Optional[str] = None) -> AsyncGenerator[Dict[str, Any], None]:
        """Async generator for streaming responses with dynamic key support."""
        active_key = override_api_key or self.api_key
        active_base_url = self.base_url
        active_model = self.model
        active_provider = self.provider

        if override_api_key:
            if override_api_key.startswith("nvapi-"):
                active_provider = "nvidia"
                active_base_url = self.nvidia_base_url
                active_model = self.nvidia_model
            elif override_api_key.startswith("mistral-"):
                active_provider = "mistral"
                active_base_url = self.mistral_base_url
                active_model = self.mistral_model
            elif override_api_key.startswith("sk-"):
                active_provider = "openai"
                active_base_url = self.openai_base_url
                active_model = self.openai_model

        try:
            temp_client = AsyncOpenAI(api_key=active_key, base_url=active_base_url)
            completion = await temp_client.chat.completions.create(
                model=active_model,
                messages=messages,
                temperature=options.get("temperature", 1.0),
                top_p=options.get("top_p", 1.0),
                max_tokens=options.get("max_tokens", 4096),
                stream=True,
                extra_body={"reasoning_effort": options.get("reasoning_effort", "medium")} if active_provider == "nvidia" and options.get("reasoning_effort") else {}
            )

            async for chunk in completion:
                if not chunk.choices:
                    continue
                
                delta = chunk.choices[0].delta
                reasoning = getattr(delta, "reasoning_content", None)
                content = delta.content

                yield {
                    "reasoning": reasoning,
                    "content": content,
                    "provider": active_provider,
                    "model": active_model
                }
        except Exception as e:
            print(f"[LLM] [x] {active_provider.upper()} Stream Failure: {e}")
            yield {"error": str(e)}

    def chat(self, messages: List[Dict[str, str]] = [], format: Optional[str] = None, options: Dict[str, Any] = {}, override_api_key: Optional[str] = None):
        """Invoke LLM API synchronously with dynamic key support."""
        active_key = override_api_key or self.api_key
        
        if not active_key:
            return {"message": {"content": "Error: API Key not configured."}}

        active_base_url = self.base_url
        active_model = self.model
        active_provider = self.provider

        if override_api_key:
            if override_api_key.startswith("nvapi-"):
                active_provider = "nvidia"
                active_base_url = self.nvidia_base_url
                active_model = self.nvidia_model
            elif override_api_key.startswith("mistral-"):
                active_provider = "mistral"
                active_base_url = self.mistral_base_url
                active_model = self.mistral_model
            elif override_api_key.startswith("sk-"):
                active_provider = "openai"
                active_base_url = self.openai_base_url
                active_model = self.openai_model

        if format == "json":
            if messages and messages[-1]["role"] == "user":
                if "json" not in messages[-1]["content"].lower():
                    messages[-1]["content"] += "\n\nCRITICAL: Respond with valid JSON only."

        try:
            temp_client = OpenAI(api_key=active_key, base_url=active_base_url)
            response = temp_client.chat.completions.create(
                model=active_model,
                messages=messages,
                max_tokens=options.get("max_tokens", 4096),
                temperature=options.get("temperature", 1.0),
                top_p=options.get("top_p", 1.0),
                stream=False,
                extra_body={"reasoning_effort": options.get("reasoning_effort", "medium")} if active_provider == "nvidia" and options.get("reasoning_effort") else {}
            )
            message = response.choices[0].message
            return {
                "model": active_model,
                "message": {
                    "role": "assistant", 
                    "content": message.content,
                    "reasoning": getattr(message, "reasoning_content", None)
                },
                "provider": active_provider
            }
        except Exception as e:
            print(f"[LLM] [x] {active_provider.upper()} Sync API Call Failed: {e}")
            return {"message": {"content": f"I'm sorry, I encountered a technical error: {str(e)}"}}

# Singleton instance
llm_service = LLMService()
