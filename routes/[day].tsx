/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import {
  DynamoDBClient,
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

export const handler: Handlers<Match> = {
  async GET(req, ctx) {
    const headers = {};
    for (const [key, value] of req.headers.entries()) {
      headers[key] = value;
    }
    const { day } = ctx.params;
    const startOfDay = formatter.parse(day);
    const endOfDay = addDays(startOfDay, 1);
    const { Items } = await client.send(
      new ScanCommand({
        TableName: "BeIN_schedule",
        FilterExpression: "#s BETWEEN :dayStart AND :dayEnd",
        ExpressionAttributeNames: {
          "#s": "start",
        },
        ExpressionAttributeValues: {
          ":dayStart": {
            N: startOfDay.getTime().toString(),
          },
          ":dayEnd": {
            N: endOfDay.getTime().toString(),
          },
        },
      }),
    );
    return ctx.render({
      date: new Date().toString(),
      startOfDay: startOfDay.toString(),
      matches: Items.map(unmarshall),
      headers,
    });
  },
};

export default function Greet(props: PageProps) {
  return (
    <div>
      <h1>rendered at {props.data.date}</h1>
      <i>Start of the day {props.data.startOfDay}</i>
      <pre>
        {JSON.stringify(props.data, null, 2)}
      </pre>

      <h2>Headers on deno deploy:</h2>
      <pre>
        <code>
          {JSON.stringify(props.data.headers, null, 2)}
        </code>
      </pre>
    </div>
  );
}
