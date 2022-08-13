/** @jsx h */
import {h} from "preact";
import {Handlers, PageProps} from "$fresh/server.ts";
import {
  DynamoDBClient,
  GetItemCommand,
} from "https://esm.sh/@aws-sdk/client-dynamodb";
import {
  unmarshall,
} from "https://esm.sh/@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({
  region: Deno.env.get("AWS_REGION"),
  credentials: {
    accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID"),
    secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY"),
  },
})

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
  async GET(_, ctx) {
    const { Item } = await client.send(new GetItemCommand({
      TableName: "BeIN_schedule",
      Key: {
        id: {
          S: ctx.params.name,
        }
      }
    }));
    return ctx.render(unmarshall(Item));
  }
}

export default function Greet(props: PageProps) {
  return <div>
    Hello {props.params.name}
    <p>{props.data.away}</p>
    <p>{props.data.name}</p>
  </div>;
}
