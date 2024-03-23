export default function DynamicComponent({ name }: { name: string }) {
  return (
    <div>
      {name} Component 🔥 Random number = {Math.random()}
    </div>
  );
}
