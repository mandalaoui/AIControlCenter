"use client";

import { TeamCard } from "@/components/teams/team-card";
import type { TeamDetailCard } from "@/lib/types";

interface TeamsGridProps {
  teams: TeamDetailCard[];
}

export function TeamsGrid({ teams }: TeamsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {teams
        .slice()
        .sort((a, b) => b.spend - a.spend)
        .map((team) => (
          <TeamCard key={team.name} team={team} />
        ))}
    </div>
  );
}
