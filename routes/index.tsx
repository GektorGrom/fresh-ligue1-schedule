/** @jsx h */
import { h } from "preact";
import { DateTimeFormatter } from "https://deno.land/std@0.152.0/datetime/formatter.ts";

import Counter from "../islands/Counter.tsx";

import { Handlers } from "$fresh/server.ts";

const formatter = new DateTimeFormatter("yyyy-MM-dd");
export const handler: Handlers = {
  GET(req, ctx) {
    return Response.redirect(req.url + formatter.format(new Date()));
  },
};

export default function Home() {
  return <div></div>;
}
