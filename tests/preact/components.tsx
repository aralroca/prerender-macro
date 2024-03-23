import { h } from "preact";

export default function Foo({
  name = "foo",
  nested = {},
}: {
  name: string;
  nested: { foo?: string };
}) {
  return (
    <div>
      Foo, {name}
      {nested.foo}!
    </div>
  );
}

export function Bar({ name = "bar" }: { name: string }) {
  return <div>Bar, {name}!</div>;
}
