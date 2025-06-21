// type
type Props = {
  children: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
  active?: boolean;
};

function CircularButton({ children, onClick, disabled = false, active = false }: Props) {
  return (
    <div>
      <button
        disabled={disabled}
        className={`${active ? 'text-blue-500' : 'text-gray-500'} p-1 rounded-full ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-300'
        }`}
        onClick={() => onClick()}
      >
        {children}
      </button>
    </div>
  );
}

export default CircularButton;
