export default function StaticComponent({ name }: { name: string }) {
  return (
    <div>
      {name} Component 🥶 Random number = {Math.random()}
    </div>
  );
}
