/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import addDays from "https://deno.land/x/date_fns@v2.22.1/addDays/index.ts";
import startOfDay from "https://deno.land/x/date_fns@v2.22.1/startOfDay/index.ts";

interface Match {
  "away": string;
  "isLigueShow": boolean | string;
  "isLive": boolean | string;
  "chanel": string;
  "id": string;
  "home": string;
  "title": string;
  "start": number;
}

interface MatchesProps {
  matches: Match[];
  day?: string;
}

export default function Matches(props: MatchesProps) {
  const today = new Date();
  const dateStart = startOfDay(today);
  const dateEnd = addDays(dateStart, 1);
  const startTime = dateStart.getTime();
  const endTime = dateEnd.getTime();
  const matches = props.matches.filter(({ start }) =>
    start >= startTime && start < endTime
  ).map((match) => {
    return {
      ...match,
      prettyStart: new Date(match.start).toString(),
    };
  });
  return (
    <div class={tw`flex gap-2 w-full`}>
      <div>
        {matches.map((match) => {
          return (
            <div class={tw`flex gap-2`}>
              <p class={tw`flex-grow-1 flex-shrink-1`}>{match.prettyStart}</p>
              <p class={tw`flex-grow-1`}>{match.home}</p>
              <p class={tw`flex-grow-1`}>{match.away}</p>
              <p class={tw`flex-grow-0`}>{match.chanel}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
