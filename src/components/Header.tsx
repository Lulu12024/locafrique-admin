

interface HeaderProps {
  title: string;
  description: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="px-4 lg:px-8 py-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        </div>
      </div>
    </header>
  );
}