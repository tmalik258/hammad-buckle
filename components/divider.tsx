export default function Divider({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex-1 h-px bg-gray-300"></div>
      <div className="px-4 text-center text-gray-400">{text}</div>
      <div className="flex-1 h-px bg-gray-300"></div>
    </div>
  );
}
