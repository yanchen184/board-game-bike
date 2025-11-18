import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import CharacterCard from '../components/CharacterCard';
import { addMember, setFormation } from '../store/teamSlice';
import { selectFrame, selectWheels, selectGears } from '../store/bikeSlice';
import { setPhase } from '../store/gameSlice';
import { charactersArray } from '../data/characters';
import { bikeParts } from '../data/bikeParts';
import { BUDGET_LIMIT, MIN_TEAM_SIZE, MAX_TEAM_SIZE, FORMATION_TYPES, GAME_PHASES } from '../utils/constants';

function SetupPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(0); // 0: team, 1: bike, 2: formation

  // Set game phase to SETUP when component mounts
  useEffect(() => {
    dispatch(setPhase(GAME_PHASES.SETUP));
  }, [dispatch]);

  const teamMembers = useSelector(state => state.team.members);
  const bikeStats = useSelector(state => state.bike);
  const formation = useSelector(state => state.team.formation);

  // Calculate total cost
  const teamCost = teamMembers.reduce((sum, m) => sum + (m.cost || 0), 0);
  const bikeCost = bikeStats.totalCost || 0;
  const totalCost = teamCost + bikeCost;
  const remaining = BUDGET_LIMIT - totalCost;

  const handleSelectCharacter = character => {
    if (teamMembers.some(m => m.id === character.id)) {
      toast.error('此角色已在隊伍中');
      return;
    }

    if (teamMembers.length >= MAX_TEAM_SIZE) {
      toast.error(`隊伍已滿（最多${MAX_TEAM_SIZE}人）`);
      return;
    }

    if (totalCost + character.cost > BUDGET_LIMIT) {
      toast.error('預算不足！');
      return;
    }

    dispatch(addMember(character));
    toast.success(`${character.name} 加入隊伍！`);
  };

  const handleSelectBikePart = (type, part) => {
    if (totalCost - (bikeStats[type]?.cost || 0) + part.cost > BUDGET_LIMIT) {
      toast.error('預算不足！');
      return;
    }

    switch (type) {
      case 'frame':
        dispatch(selectFrame(part));
        break;
      case 'wheels':
        dispatch(selectWheels(part));
        break;
      case 'gears':
        dispatch(selectGears(part));
        break;
    }

    toast.success(`已選擇 ${part.name}`);
  };

  const canProceed = () => {
    if (step === 0) return teamMembers.length >= MIN_TEAM_SIZE;
    if (step === 1) return bikeStats.frame && bikeStats.wheels && bikeStats.gears;
    if (step === 2) return true;
    return false;
  };

  const handleNext = () => {
    if (!canProceed()) {
      if (step === 0) toast.error(`至少需要${MIN_TEAM_SIZE}名隊員`);
      if (step === 1) toast.error('請選擇完整的裝備');
      return;
    }

    if (step < 2) {
      setStep(step + 1);
    } else {
      // Start race
      dispatch(setPhase(GAME_PHASES.RACING));
      navigate('/game');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4" data-testid="setup-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4" data-testid="setup-title">遊戲設定</h1>

          {/* Progress Steps */}
          <div className="flex gap-4 mb-6">
            {['選擇團隊', '配置裝備', '隊形設定'].map((label, idx) => (
              <div
                key={idx}
                className={`flex-1 p-4 rounded-lg text-center font-semibold transition-all ${
                  idx === step
                    ? 'bg-gradient-sunset text-white'
                    : idx < step
                    ? 'bg-primary-green text-white'
                    : 'bg-neutral-200 text-neutral-500'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Budget Display */}
          <Card className="bg-gradient-sky text-white">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm opacity-90">預算</div>
                <div className="text-3xl font-bold">${BUDGET_LIMIT}</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">已使用</div>
                <div className="text-3xl font-bold">${totalCost}</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">剩餘</div>
                <div className={`text-3xl font-bold ${remaining < 0 ? 'text-accent-red' : ''}`}>
                  ${remaining}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Step Content */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">選擇團隊成員 ({teamMembers.length}/{MAX_TEAM_SIZE})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {charactersArray.map(char => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isSelected={teamMembers.some(m => m.id === char.id)}
                  onSelect={() => handleSelectCharacter(char)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">配置腳踏車裝備</h2>

            {/* Frames */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">車架</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {bikeParts.frames.map(frame => (
                  <Card
                    key={frame.id}
                    className={bikeStats.frame?.id === frame.id ? 'ring-4 ring-primary-orange' : ''}
                    hover
                    onClick={() => handleSelectBikePart('frame', frame)}
                    data-testid={`equipment-card-frame-${frame.id}`}
                  >
                    <h4 className="font-bold mb-2">{frame.name}</h4>
                    <div className="text-sm text-neutral-600 mb-3">{frame.description}</div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>重量: {frame.weight}kg</span>
                      <span>空氣動力: {frame.aero}</span>
                    </div>
                    <div className="text-lg font-bold text-primary-orange">${frame.cost}</div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Wheels */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">輪組</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {bikeParts.wheels.map(wheels => (
                  <Card
                    key={wheels.id}
                    className={bikeStats.wheels?.id === wheels.id ? 'ring-4 ring-primary-orange' : ''}
                    hover
                    onClick={() => handleSelectBikePart('wheels', wheels)}
                    data-testid={`equipment-card-wheels-${wheels.id}`}
                  >
                    <h4 className="font-bold mb-2">{wheels.name}</h4>
                    <div className="text-sm text-neutral-600 mb-3">{wheels.description}</div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>重量: {wheels.weight}kg</span>
                      <span>空氣動力: {wheels.aero}</span>
                    </div>
                    <div className="text-lg font-bold text-primary-orange">${wheels.cost}</div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Gears */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">變速系統</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {bikeParts.gears.map(gears => (
                  <Card
                    key={gears.id}
                    className={bikeStats.gears?.id === gears.id ? 'ring-4 ring-primary-orange' : ''}
                    hover
                    onClick={() => handleSelectBikePart('gears', gears)}
                    data-testid={`equipment-card-gears-${gears.id}`}
                  >
                    <h4 className="font-bold mb-2">{gears.name}</h4>
                    <div className="text-sm text-neutral-600 mb-3">{gears.description}</div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>精準度: {gears.precision}</span>
                      <span>重量: {gears.weight}kg</span>
                    </div>
                    <div className="text-lg font-bold text-primary-orange">${gears.cost}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">選擇破風隊形</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: FORMATION_TYPES.SINGLE, name: '單線隊形', bonus: '20%', desc: '最大風阻減少' },
                { type: FORMATION_TYPES.DOUBLE, name: '雙線並行', bonus: '15%', desc: '平衡風阻與靈活' },
                { type: FORMATION_TYPES.TRAIN, name: '火車陣型', bonus: '25%', desc: '最佳破風效果' },
              ].map(f => (
                <Card
                  key={f.type}
                  className={formation === f.type ? 'ring-4 ring-primary-orange' : ''}
                  hover
                  onClick={() => dispatch(setFormation(f.type))}
                >
                  <h3 className="text-xl font-bold mb-2">{f.name}</h3>
                  <div className="text-4xl font-bold text-primary-orange mb-2">{f.bonus}</div>
                  <div className="text-neutral-600">{f.desc}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <Button
            variant="secondary"
            onClick={() => (step > 0 ? setStep(step - 1) : navigate('/'))}
            data-testid="back-button"
          >
            {step === 0 ? '返回主選單' : '上一步'}
          </Button>

          <Button onClick={handleNext} disabled={!canProceed()} data-testid="next-button">
            {step === 2 ? '開始挑戰！' : '下一步'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SetupPage;
