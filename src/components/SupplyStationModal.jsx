import PropTypes from 'prop-types';
import Button from './ui/Button';

function SupplyStationModal({ isOpen, stationName, onDecision }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-bounce-in">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            補給站：{stationName}
          </h2>
          <p className="text-neutral-600">
            遊戲已自動暫停，請選擇您的決策
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-neutral-700 mb-1">💪 停留補給</div>
              <div className="text-neutral-600">+ 恢復 30% 體力</div>
              <div className="text-red-600">- 損失 15 分鐘</div>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">⚡ 快速通過</div>
              <div className="text-neutral-600">+ 節省時間</div>
              <div className="text-neutral-600">+ 恢復 10% 體力</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => onDecision('rest')}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">💤</div>
              <div>停留補給</div>
              <div className="text-xs opacity-90">優先恢復體力</div>
            </div>
          </Button>

          <Button
            onClick={() => onDecision('quick')}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div>快速通過</div>
              <div className="text-xs opacity-90">節省時間</div>
            </div>
          </Button>
        </div>

        <div className="mt-4 text-center text-xs text-neutral-500">
          💡 提示：體力低於 50% 建議停留補給
        </div>
      </div>
    </div>
  );
}

SupplyStationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  stationName: PropTypes.string.isRequired,
  onDecision: PropTypes.func.isRequired,
};

export default SupplyStationModal;
