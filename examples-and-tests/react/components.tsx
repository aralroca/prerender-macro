export default function Foo({ name }: { name: string }) {
  return <div>Foo, {name}!</div>;
}

export function Bar({ name }: { name: string }) {
  return <div>Bar, {name}!</div>;
}
