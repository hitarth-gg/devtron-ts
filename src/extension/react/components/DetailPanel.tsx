import ReactJson from '@microlink/react-json-view';
import { X } from 'lucide-react';
import DirectionBadge from './DirectionBadge';
import type { IpcEventDataIndexed } from '../../../types/shared';
import formatTimestamp from '../utils/formatTimestamp';

type Props = {
  selectedRow: IpcEventDataIndexed | null;
  onClose: () => void;
};
function DetailPanel({ selectedRow, onClose }: Props) {
  if (!selectedRow) return null;

  const timestamp = formatTimestamp(selectedRow.timestamp);
  return (
    <div className="h-full bg-gray-50 border-l border-gray-300 flex flex-col">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-300 bg-gray-100 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-700 flex flex-row items-center">
          Channel:
          <div className="ml-1 border border-blue-500 px-1 rounded-sm bg-blue-100">
            {selectedRow.channel}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#78797a] p-1 rounded-full hover:bg-gray-300"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-auto text-xs">
        {/* Time */}
        <div className="mb-2">
          <span className="text-gray-600">Time: </span>
          <span className="font-mono">{timestamp}</span>
        </div>

        {/* Direction */}
        <div className="mb-3 w-fit flex items-center gap-x-1">
          <span className="text-gray-600">Direction: </span>
          <DirectionBadge direction={selectedRow.direction} />
        </div>

        {/* Args */}
        <div className="border border-gray-200 rounded bg-white">
          <ReactJson
            src={selectedRow.args}
            theme="rjv-default"
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            collapsed={false}
            name={`args[${selectedRow.args.length}]`}
            style={{
              fontSize: '13px',
              fontFamily: 'Space Mono, Monaco, Menlo, "Ubuntu Mono", monospace',
              padding: '8px',
              backgroundColor: 'white',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default DetailPanel;
