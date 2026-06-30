import { useRsvpFlow } from "@/state/rsvpFlow";
import { Button } from "../ui/Button";



export default function TypeSelect() {
    const setRsvpType = useRsvpFlow((s) => s.setRsvpType);

    return (
        <div className="flex flex-col items-stretch justify-start gap-6 mt-6">
            <Button
                variant="green"
                size="lg"
                onClick={() => setRsvpType("player")}
            >
                <span className="font-semibold text-base text-paper">Player</span>
            </Button>
            <Button
                variant="red"
                size="lg"
                onClick={() => setRsvpType("spectator")}
            >
                <span className="font-semibold text-base text-paper">Spectator</span>
            </Button>
        </div>       
    )
}