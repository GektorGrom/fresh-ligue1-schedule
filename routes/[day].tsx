/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import {
  DynamoDBClient,
  QueryCommand,
  ScanCommand,
} from "https://esm.sh/@aws-sdk/client-dynamodb";
import { unmarshall } from "https://esm.sh/@aws-sdk/util-dynamodb";
import { DateTimeFormatter } from "https://deno.land/std@0.152.0/datetime/formatter.ts";
import addDays from "https://deno.land/x/date_fns@v2.22.1/addDays/index.ts";

const client = new DynamoDBClient({
  region: Deno.env.get("AWS_REGION"),
  credentials: {
    accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID"),
    secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY"),
  },
});
const formatter = new DateTimeFormatter("yyyy-MM-dd");

interface Match {
  "id": string;
  "away": string;
  "chanel": string;
  "competition": string;
  "end": number;
  "home": string;
  "isLigueShow": boolean | string;
  "isLive": boolean | string;
  "start": number;
  "title": string;
}

const QueryInput = {
  TableName: "BeIN_schedule",
  IndexName: "utcDay-start-index",
  KeyConditionExpression: "utcDay = :specificDay",
  ProjectionExpression:
    "#startTime, id, away, chanel, home, isLigueShow, isLive, title",
  ExpressionAttributeNames: {
    "#startTime": "start",
  },
};

export const handler: Handlers<Match> = {
  async GET(req, ctx) {
    const headers = {};
    for (const [key, value] of req.headers.entries()) {
      headers[key] = value;
    }
    const { day } = ctx.params;
    const startOfDay = formatter.parse(day);
    const nextDay = addDays(startOfDay, 1);
    const todayExpression = {
      ExpressionAttributeValues: {
        ":specificDay": {
          S: day,
        },
      },
    };
    const tomorrowExpression = {
      ExpressionAttributeValues: {
        ":specificDay": {
          S: formatter.format(nextDay),
        },
      },
    };
    const [todayMatches, tomorrowMatches] = await Promise.all([
      client.send(
        new QueryCommand({
          ...QueryInput,
          ...todayExpression,
        }),
      ).then(({ Items }) => Items.map(unmarshall)),
      client.send(
        new QueryCommand({
          ...QueryInput,
          ...tomorrowExpression,
        }),
      ).then(({ Items }) => Items.map(unmarshall)),
    ]);
    return ctx.render({
      date: new Date().toString(),
      matches: todayMatches.concat(tomorrowMatches),
      headers,
    });
  },
};

export default function Greet(props: PageProps) {
  const { day } = props.params;
  const startOfDay = formatter.parse(day);
  const endOfDay = addDays(startOfDay, 1);
  const startTime = startOfDay.getTime();
  const endTime = endOfDay.getTime();
  const matches = props.data.matches.filter(({ start }) =>
    start >= startTime && start < endTime
  ).map((match) => {
    return {
      ...match,
      prettyStart: new Date(match.start).toString(),
    };
  });
  return (
    <div>
      <h1>rendered at {props.data.date}</h1>
      <pre>
        {JSON.stringify(matches, null, 2)}
      </pre>
    </div>
  );
}
