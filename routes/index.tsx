/** @jsx h */
import { h } from "preact";
import Counter from "../islands/Counter.tsx";

import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
    GET(req, ctx) {
        console.log(import.meta.url);
        return Response.redirect(req.url + 'foo')
    },
};


export default function Home() {
  return (<div></div>);
}
