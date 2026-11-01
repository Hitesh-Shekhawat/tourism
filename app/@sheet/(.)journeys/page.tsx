import { JourneysIndex } from "@/components/detail/JourneysIndex";
import { Sheet } from "@/components/sheet/Sheet";

/** "View all journeys" from the story: the journeys index as a sheet (§6.7). */
export default function JourneysSheet() {
  return (
    <Sheet label="All journeys" slug="journeys">
      <JourneysIndex />
    </Sheet>
  );
}
