type Props = {
  title?: string;
};

const ScreenLoader = ({ title }: Props) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      {title && <p className="mt-4">{title}</p>}
    </div>
  );
};

export default ScreenLoader;
