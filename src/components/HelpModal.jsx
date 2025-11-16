import PropTypes from 'prop-types';
import Modal from './ui/Modal';
import Card from './ui/Card';

const HelpModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎮 遊戲說明">
      <div className="space-y-6">
        {/* Game Overview */}
        <Card>
          <h3 className="text-xl font-bold mb-3 text-primary-orange">遊戲目標</h3>
          <p className="text-neutral-700">
            完成一日北高挑戰（台北到高雄 380 公里），在 24 小時內抵達終點。透過策略規劃團隊陣容、腳踏車裝備和破風隊形，獲得最高分數！
          </p>
        </Card>

        {/* How to Play */}
        <Card>
          <h3 className="text-xl font-bold mb-3 text-primary-blue">遊戲流程</h3>
          <ol className="list-decimal list-inside space-y-2 text-neutral-700">
            <li>
              <strong>選擇團隊</strong> - 從預算內挑選 2-4 位隊員，每種角色有不同專長
            </li>
            <li>
              <strong>配置裝備</strong> - 選擇車架、輪組、變速系統，平衡重量與性能
            </li>
            <li>
              <strong>設定隊形</strong> - 選擇破風隊形，減少風阻提升速度
            </li>
            <li>
              <strong>開始競賽</strong> - 實時監控團隊狀態，應對各種事件
            </li>
          </ol>
        </Card>

        {/* Character Types */}
        <Card>
          <h3 className="text-xl font-bold mb-3 text-primary-green">角色類型</h3>
          <div className="space-y-3 text-neutral-700">
            <div>
              <strong>🚵 爬坡手 (Climber)</strong> - 山路加成 +20%，適合高海拔路段
            </div>
            <div>
              <strong>⚡ 衝刺手 (Sprinter)</strong> - 平路加速 +25%，適合平坦路段
            </div>
            <div>
              <strong>🛡️ 副將 (Domestique)</strong> - 隊友體力恢復 +15%，團隊協作專家
            </div>
            <div>
              <strong>🎯 全能型 (All-Rounder)</strong> - 平衡型選手，適應各種地形
            </div>
          </div>
        </Card>

        {/* Formation Types */}
        <Card>
          <h3 className="text-xl font-bold mb-3 text-accent-purple">破風隊形</h3>
          <div className="space-y-3 text-neutral-700">
            <div>
              <strong>單線隊形</strong> - 20% 風阻減少，標準破風陣型
            </div>
            <div>
              <strong>雙線並行</strong> - 15% 風阻減少，平衡風阻與靈活性
            </div>
            <div>
              <strong>火車陣型</strong> - 25% 風阻減少，最佳破風效果但需要協調
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-sky text-white">
          <h3 className="text-xl font-bold mb-3">💡 遊戲提示</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>領騎者體力消耗 1.5 倍，記得輪替！</li>
            <li>在補給站休息可以恢復隊員體力</li>
            <li>注意天氣變化，逆風會降低速度</li>
            <li>預算有限，平衡團隊和裝備的投資</li>
            <li>完成挑戰時間越短、團隊完成率越高，分數越高</li>
          </ul>
        </Card>
      </div>
    </Modal>
  );
};

HelpModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default HelpModal;
