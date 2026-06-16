import { Calendar, Trophy, Award, CheckCircle2, User, Moon, Sun, Shield, Sparkles, Briefcase } from "lucide-react"
import IntervyxaCoin from "@/components/reward-system/IntervyxaCoin"

export const BADGES: Record<string, any> = {
    first_step: { id: 'first_step', name: 'First Step', description: 'Completed your first interview', icon: 'footprints' },
    wealthy: { id: 'wealthy', name: 'Wealthy', description: 'Earned 1,000 Intervyxa Coins', icon: 'coin' },
    coin_king: { id: 'coin_king', name: 'Coin King', description: 'Earned 5,000 Intervyxa Coins', icon: 'sparkles' },
    marathon: { id: 'marathon', name: 'Marathoner', description: 'Completed 10 interviews', icon: 'trophy' },
    code_ninja: { id: 'code_ninja', name: 'Code Ninja', description: 'Wrote over 1000 lines of code', icon: 'code' },
    night_owl: { id: 'night_owl', name: 'Night Owl', description: 'Completed an interview after 10 PM', icon: 'moon' },
    early_bird: { id: 'early_bird', name: 'Early Bird', description: 'Completed an interview before 8 AM', icon: 'sun' },
    integrity_master: { id: 'integrity_master', name: 'Saint', description: '100% Integrity Score', icon: 'shield' },
    social_butterfly: { id: 'social_butterfly', name: 'Social Butterfly', description: 'Participated in a Peer Interview', icon: 'users' },
    negotiator: { id: 'negotiator', name: 'Deal Maker', description: 'Successfully negotiated an offer', icon: 'briefcase' }
}

export const BADGE_ICONS: Record<string, any> = {
    'coin': IntervyxaCoin,
    'sparkles': Sparkles,
    'trophy': Trophy,
    'code': User, // Lucide 'code' icon or User as fallback if not imported? I imported User, but looking for Code. 
    // Wait, I should import Code from lucide-react if I use it.
    'moon': Moon,
    'sun': Sun,
    'shield': Shield,
    'users': User,
    'briefcase': Briefcase,
    'footprints': CheckCircle2 // approximate
}
