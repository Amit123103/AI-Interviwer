export interface TopicCategory {
    id: string
    label: string
    icon: string
    color: string
}

export interface DiscussionTopic {
    id: string
    title: string
    description: string
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
    style: string
    rating: number
    timesDiscussed: number
    proSide: string
    conSide: string
    keyPoints: string[]
    facts: string[]
    controversyLevel: 'low' | 'medium' | 'high'
    estimatedDuration: string
    idealGroupSize: string
    isNew?: boolean
    isTrending?: boolean
}

export interface SessionHistory {
    id: string
    topic: string
    category: string
    mode: 'ai' | 'friends' | 'code' | 'public'
    date: string
    duration: string
    participants: number
    score: number
    grade: string
    rank: number
    topError: string
}

export const topicCategories: TopicCategory[] = [
    { id: 'career', label: 'Career & Jobs', icon: '💼', color: 'indigo' },
    { id: 'world-affairs', label: 'World Affairs', icon: '🌍', color: 'blue' },
    { id: 'science-tech', label: 'Science & Tech', icon: '🧬', color: 'cyan' },
    { id: 'education', label: 'Education', icon: '🏫', color: 'emerald' },
    { id: 'economy', label: 'Economy & Finance', icon: '💰', color: 'amber' },
    { id: 'environment', label: 'Environment', icon: '🌱', color: 'green' },
    { id: 'sports', label: 'Sports & Fitness', icon: '⚽', color: 'orange' },
    { id: 'culture', label: 'Culture & Society', icon: '🎭', color: 'purple' },
    { id: 'health', label: 'Health & Medicine', icon: '🏥', color: 'rose' },
    { id: 'ai-future', label: 'AI & Future Tech', icon: '🤖', color: 'violet' },
    { id: 'philosophy', label: 'Philosophy & Ethics', icon: '🧠', color: 'fuchsia' },
    { id: 'gaming', label: 'Gaming & Entertainment', icon: '🎮', color: 'pink' },
    { id: 'space', label: 'Space & Exploration', icon: '🚀', color: 'sky' },
    { id: 'urban', label: 'Urban Life', icon: '🏙️', color: 'slate' },
    { id: 'family', label: 'Family & Relationships', icon: '👨‍👩‍👧', color: 'red' },
    { id: 'social-media', label: 'Social Media', icon: '📱', color: 'blue' },
    { id: 'research', label: 'Research & Innovation', icon: '🔬', color: 'teal' },
    { id: 'arts', label: 'Arts & Creativity', icon: '🎨', color: 'yellow' },
    { id: 'law', label: 'Law & Justice', icon: '⚖️', color: 'zinc' },
    { id: 'security', label: 'National Security', icon: '🛡️', color: 'stone' },
]

export const topicStyles = [
    { id: 'debate', label: 'Debate Style', icon: '❓', desc: 'Two clear opposing sides' },
    { id: 'open', label: 'Open Discussion', icon: '💡', desc: 'Explore multiple perspectives' },
    { id: 'future', label: 'Future Prediction', icon: '🔮', desc: 'What will/should happen' },
    { id: 'problem', label: 'Problem & Solution', icon: '🔍', desc: 'Identify and solve' },
    { id: 'compare', label: 'Compare & Contrast', icon: '📊', desc: 'Compare approaches' },
    { id: 'roleplay', label: 'Role-Play Scenario', icon: '🎭', desc: 'Discuss from a role' },
]

export const difficultyLevels = [
    { id: 'easy', label: 'Easy', icon: '🟢', desc: 'Simple, relatable topics', color: 'emerald' },
    { id: 'medium', label: 'Medium', icon: '🟡', desc: 'Requires reasoning', color: 'yellow' },
    { id: 'hard', label: 'Hard', icon: '🔴', desc: 'Complex, multi-dimensional', color: 'red' },
]

export const topicLibrary: DiscussionTopic[] = [
    { id: 't1', title: 'Should AI replace human teachers in schools?', description: 'Explore whether artificial intelligence can effectively take over the role of human educators in classrooms.', category: 'ai-future', difficulty: 'medium', style: 'debate', rating: 4.9, timesDiscussed: 12400, proSide: 'AI can personalize learning at scale and is available 24/7', conSide: 'Human connection and mentorship cannot be replicated by machines', keyPoints: ['Personalization vs empathy', 'Cost efficiency vs quality', 'Accessibility in developing nations', 'Student mental health needs'], facts: ['Finland ranks #1 in education with minimal tech in classrooms', 'AI tutoring improved test scores by 30% in Stanford study'], controversyLevel: 'high', estimatedDuration: '20 min', idealGroupSize: '4-6', isTrending: true },
    { id: 't2', title: 'Is remote work better than office work?', description: 'Compare the benefits and drawbacks of remote work versus traditional office environments.', category: 'career', difficulty: 'easy', style: 'compare', rating: 4.7, timesDiscussed: 9800, proSide: 'Flexibility, no commute, better work-life balance', conSide: 'Isolation, harder collaboration, blurred boundaries', keyPoints: ['Productivity comparison', 'Mental health impact', 'Company culture', 'Career growth opportunities'], facts: ['65% of workers want full-time remote', 'Remote workers save an average of 40 min/day on commute'], controversyLevel: 'medium', estimatedDuration: '15 min', idealGroupSize: '3-5' },
    { id: 't3', title: 'Should social media be regulated by governments?', description: 'Debate whether governments should impose regulations on social media platforms to combat misinformation and protect users.', category: 'social-media', difficulty: 'medium', style: 'debate', rating: 4.8, timesDiscussed: 11200, proSide: 'Protects users from misinformation and mental health harm', conSide: 'Threatens free speech and innovation', keyPoints: ['Free speech vs safety', 'Misinformation control', 'Data privacy', 'Impact on democracy'], facts: ['EU Digital Services Act covers 450M users', 'Average teen spends 7+ hours daily on social media'], controversyLevel: 'high', estimatedDuration: '20 min', idealGroupSize: '4-6', isTrending: true },
    { id: 't4', title: 'Should school uniforms be mandatory?', description: 'A classic debate on whether schools should require students to wear uniforms.', category: 'education', difficulty: 'easy', style: 'debate', rating: 4.5, timesDiscussed: 8700, proSide: 'Reduces bullying and promotes equality', conSide: 'Restricts individual expression and adds costs', keyPoints: ['Equality vs expression', 'Bullying reduction', 'Economic impact on families', 'Student identity'], facts: ['22 countries mandate school uniforms nationally', 'Studies show 10% reduction in bullying with uniforms'], controversyLevel: 'low', estimatedDuration: '12 min', idealGroupSize: '3-5' },
    { id: 't5', title: 'Should developing nations prioritize economic growth over environmental sustainability?', description: 'A complex debate about the trade-offs between economic development and environmental protection in emerging economies.', category: 'environment', difficulty: 'hard', style: 'debate', rating: 4.9, timesDiscussed: 7600, proSide: 'Poverty reduction requires industrial growth first', conSide: 'Climate change will cause far greater economic damage long-term', keyPoints: ['Short-term vs long-term thinking', 'Green technology costs', 'Global equity in climate responsibility', 'Alternative development models'], facts: ['Developing nations produce 63% of global emissions', 'Renewable energy is now cheaper than coal in 90% of the world'], controversyLevel: 'high', estimatedDuration: '25 min', idealGroupSize: '4-6' },
    { id: 't6', title: 'Is cryptocurrency the future of money?', description: 'Discuss whether digital currencies will replace traditional fiat currencies.', category: 'economy', difficulty: 'medium', style: 'future', rating: 4.6, timesDiscussed: 6900, proSide: 'Decentralized, borderless, and inflation-resistant', conSide: 'Volatile, energy-intensive, and lacks regulation', keyPoints: ['Decentralization benefits', 'Environmental cost', 'Financial inclusion', 'Government response'], facts: ['Over 420M people own cryptocurrency worldwide', 'Bitcoin consumes more energy than many small countries'], controversyLevel: 'medium', estimatedDuration: '18 min', idealGroupSize: '3-5' },
    { id: 't7', title: 'Should voting be mandatory in democracies?', description: 'Explore whether citizens should be legally required to vote in elections.', category: 'law', difficulty: 'medium', style: 'debate', rating: 4.7, timesDiscussed: 5400, proSide: 'Ensures true representation and civic participation', conSide: 'Forced voting is undemocratic and may increase uninformed votes', keyPoints: ['Civic duty vs individual freedom', 'Voter apathy solutions', 'Quality of democracy', 'Enforcement challenges'], facts: ['22 countries have compulsory voting laws', 'Australia fines non-voters ~$20 AUD'], controversyLevel: 'medium', estimatedDuration: '18 min', idealGroupSize: '4-6' },
    { id: 't8', title: 'Will humans colonize Mars within 50 years?', description: 'Predict whether space colonization on Mars is achievable in the next half-century.', category: 'space', difficulty: 'medium', style: 'future', rating: 4.8, timesDiscussed: 8200, proSide: 'Rapid advances in rocketry and habitation tech make it feasible', conSide: 'Radiation, cost, and ethical concerns make it unrealistic', keyPoints: ['Technology readiness', 'Funding and political will', 'Biological challenges', 'Ethical priorities'], facts: ['SpaceX plans first crewed Mars mission by 2030', 'Mars trip takes 6-9 months one-way'], controversyLevel: 'low', estimatedDuration: '15 min', idealGroupSize: '3-5', isTrending: true },
    { id: 't9', title: 'Should there be a universal basic income?', description: 'Debate whether governments should provide a guaranteed income to all citizens regardless of employment.', category: 'economy', difficulty: 'hard', style: 'problem', rating: 4.8, timesDiscussed: 7100, proSide: 'Eliminates poverty and provides safety net for automation job losses', conSide: 'Too expensive and may reduce motivation to work', keyPoints: ['Automation and job displacement', 'Poverty elimination', 'Funding mechanisms', 'Work incentives'], facts: ['Finland trialed UBI for 2 years with positive results', 'Estimated US UBI cost: $3.8 trillion/year'], controversyLevel: 'high', estimatedDuration: '22 min', idealGroupSize: '4-6' },
    { id: 't10', title: 'Is e-sports a real sport?', description: 'Debate whether competitive gaming deserves the same recognition as traditional sports.', category: 'gaming', difficulty: 'easy', style: 'debate', rating: 4.4, timesDiscussed: 9500, proSide: 'Requires skill, training, teamwork, and millions watch it', conSide: 'Lacks physical exertion that defines traditional sports', keyPoints: ['Definition of sport', 'Physical vs mental skills', 'Commercial viability', 'Olympic inclusion'], facts: ['E-sports revenue expected to reach $1.8B by 2025', 'League of Legends World Finals had 73M viewers'], controversyLevel: 'low', estimatedDuration: '12 min', idealGroupSize: '3-5' },
    { id: 't11', title: 'Should genetic engineering be used on humans?', description: 'Explore the ethical boundaries of using gene editing technologies like CRISPR on human embryos.', category: 'science-tech', difficulty: 'hard', style: 'debate', rating: 4.9, timesDiscussed: 6300, proSide: 'Could eliminate genetic diseases and save millions of lives', conSide: 'Designer babies, inequality, and unknown long-term risks', keyPoints: ['Disease elimination', 'Designer babies ethics', 'Access inequality', 'Long-term genetic risks'], facts: ['CRISPR can edit genes in hours vs years with older methods', 'First gene-edited babies born in China in 2018'], controversyLevel: 'high', estimatedDuration: '25 min', idealGroupSize: '4-6', isNew: true },
    { id: 't12', title: 'Should college education be free for everyone?', description: 'Discuss whether higher education should be publicly funded and free at the point of access.', category: 'education', difficulty: 'easy', style: 'debate', rating: 4.6, timesDiscussed: 10200, proSide: 'Increases social mobility and reduces inequality', conSide: 'Unsustainable cost burden and may devalue degrees', keyPoints: ['Cost vs investment', 'Social mobility', 'Degree value', 'Alternative education paths'], facts: ['Average US student debt is $37,000', 'Germany offers free university to all including international students'], controversyLevel: 'medium', estimatedDuration: '15 min', idealGroupSize: '3-5' },
    { id: 't13', title: 'Is privacy dead in the digital age?', description: 'Discuss whether personal privacy can survive in an era of surveillance capitalism and data collection.', category: 'social-media', difficulty: 'medium', style: 'open', rating: 4.7, timesDiscussed: 7800, proSide: 'Data collection enables better services and security', conSide: 'Mass surveillance threatens individual freedom and democracy', keyPoints: ['Surveillance capitalism', 'Data ownership', 'Government surveillance', 'Personal responsibility'], facts: ['Average person has 100+ online accounts', 'Global data creation will reach 180 zettabytes by 2025'], controversyLevel: 'medium', estimatedDuration: '18 min', idealGroupSize: '4-6' },
    { id: 't14', title: 'Should animals be used in scientific research?', description: 'Debate the ethics of animal testing in medical and scientific research.', category: 'philosophy', difficulty: 'medium', style: 'debate', rating: 4.6, timesDiscussed: 5900, proSide: 'Has saved millions of human lives through medical breakthroughs', conSide: 'Inflicts suffering on sentient beings and alternatives exist', keyPoints: ['Medical necessity', 'Animal rights', 'Alternative methods', 'Regulatory frameworks'], facts: ['115M animals used in research annually worldwide', 'Over 90% of drugs that pass animal tests fail in humans'], controversyLevel: 'high', estimatedDuration: '20 min', idealGroupSize: '4-6' },
    { id: 't15', title: 'Will self-driving cars make roads safer?', description: 'Predict whether autonomous vehicles will significantly reduce traffic accidents and deaths.', category: 'ai-future', difficulty: 'medium', style: 'future', rating: 4.5, timesDiscussed: 6700, proSide: '94% of accidents are caused by human error which AI eliminates', conSide: 'Technology failures, ethical dilemmas, and job losses', keyPoints: ['Safety statistics', 'Ethical trolley problems', 'Job displacement', 'Infrastructure needs'], facts: ['1.35M people die in road accidents annually', 'Waymo self-driving cars have driven 20M+ miles'], controversyLevel: 'medium', estimatedDuration: '18 min', idealGroupSize: '3-5' },
    { id: 't16', title: 'Should parents monitor their children\'s social media?', description: 'Discuss the balance between child safety and privacy in digital parenting.', category: 'family', difficulty: 'easy', style: 'open', rating: 4.5, timesDiscussed: 8100, proSide: 'Protects children from cyberbullying and predators', conSide: 'Invades privacy and damages trust between parent and child', keyPoints: ['Safety vs privacy', 'Age-appropriate monitoring', 'Digital literacy', 'Trust building'], facts: ['70% of teens hide online activity from parents', 'Cyberbullying affects 37% of children aged 12-17'], controversyLevel: 'low', estimatedDuration: '12 min', idealGroupSize: '3-5' },
    { id: 't17', title: 'Is nuclear energy the solution to climate change?', description: 'Evaluate whether nuclear power should be expanded as a clean energy source to combat global warming.', category: 'environment', difficulty: 'hard', style: 'problem', rating: 4.7, timesDiscussed: 5200, proSide: 'Zero-emission baseload power that works rain or shine', conSide: 'Nuclear waste, meltdown risks, and extremely high costs', keyPoints: ['Carbon footprint comparison', 'Safety record', 'Waste management', 'Cost vs renewables'], facts: ['Nuclear provides 10% of global electricity', 'France gets 70% of its electricity from nuclear'], controversyLevel: 'high', estimatedDuration: '22 min', idealGroupSize: '4-6', isNew: true },
    { id: 't18', title: 'Should athletes be allowed to use performance-enhancing drugs?', description: 'Debate whether the use of PEDs should be legalized and regulated in professional sports.', category: 'sports', difficulty: 'medium', style: 'debate', rating: 4.4, timesDiscussed: 4800, proSide: 'Athletes already push boundaries and regulation could make it safer', conSide: 'Unfair advantage, health risks, and destroys the spirit of sport', keyPoints: ['Fair competition', 'Health risks', 'Regulatory challenges', 'Natural vs enhanced performance'], facts: ['WADA conducts 300,000+ doping tests annually', 'Lance Armstrong was stripped of 7 Tour de France titles'], controversyLevel: 'medium', estimatedDuration: '15 min', idealGroupSize: '3-5' },
    { id: 't19', title: 'Can art created by AI be considered real art?', description: 'Explore whether AI-generated paintings, music, and writing qualify as genuine creative works.', category: 'arts', difficulty: 'medium', style: 'open', rating: 4.8, timesDiscussed: 7400, proSide: 'Art is about the output and its emotional impact, not the creator', conSide: 'True art requires human consciousness, emotion, and intent', keyPoints: ['Definition of creativity', 'Emotional authenticity', 'Copyright implications', 'Human-AI collaboration'], facts: ['AI painting sold for $432,500 at Christie\'s', 'Spotify has removed AI-generated fake songs from its platform'], controversyLevel: 'medium', estimatedDuration: '18 min', idealGroupSize: '3-5', isTrending: true },
    { id: 't20', title: 'Should the death penalty be abolished worldwide?', description: 'Debate whether capital punishment has a place in modern justice systems.', category: 'law', difficulty: 'hard', style: 'debate', rating: 4.8, timesDiscussed: 6100, proSide: 'Irreversible, no proven deterrent effect, and risk of executing innocents', conSide: 'Justice for worst crimes, deterrent, and closure for victims', keyPoints: ['Deterrence evidence', 'Wrongful convictions', 'Human rights', 'Victim justice'], facts: ['106 countries have abolished the death penalty', '186 people on US death row were later exonerated'], controversyLevel: 'high', estimatedDuration: '25 min', idealGroupSize: '4-6' },
]

export const mockSessionHistory: SessionHistory[] = [
    { id: 's1', topic: 'Should AI replace human teachers in schools?', category: 'ai-future', mode: 'ai', date: '2026-03-08', duration: '22 min', participants: 4, score: 82, grade: 'A', rank: 1, topError: '3 grammar errors' },
    { id: 's2', topic: 'Is remote work better than office work?', category: 'career', mode: 'friends', date: '2026-03-07', duration: '18 min', participants: 5, score: 74, grade: 'B+', rank: 2, topError: '5 filler words' },
    { id: 's3', topic: 'Will humans colonize Mars within 50 years?', category: 'space', mode: 'public', date: '2026-03-06', duration: '15 min', participants: 6, score: 68, grade: 'B', rank: 4, topError: '2 off-topic points' },
    { id: 's4', topic: 'Is e-sports a real sport?', category: 'gaming', mode: 'friends', date: '2026-03-05', duration: '12 min', participants: 3, score: 88, grade: 'A+', rank: 1, topError: 'None significant' },
    { id: 's5', topic: 'Should college education be free?', category: 'education', mode: 'ai', date: '2026-03-04', duration: '20 min', participants: 4, score: 71, grade: 'B', rank: 3, topError: '4 weak arguments' },
]

export const modeLabels: Record<string, { label: string; color: string; icon: string }> = {
    ai: { label: 'AI Discussion', color: 'violet', icon: '🤖' },
    friends: { label: 'With Friends', color: 'emerald', icon: '👥' },
    code: { label: 'Code & Tech', color: 'blue', icon: '💻' },
    public: { label: 'Public Room', color: 'amber', icon: '🌐' },
}
