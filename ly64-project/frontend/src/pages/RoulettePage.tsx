import {
  ActiveBetsList,
  BettingTable,
  ChipSelector,
  HistoryStrip,
  PageHeader,
  ResultDisplay,
  RouletteWheel,
  SpinButton,
} from '@/components/roulette';
import { useRouletteGame } from '@/hooks/useRouletteGame';

export default function RoulettePage() {
  const game = useRouletteGame();

  return (
    <div className="min-h-screen bg-[#061410] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(52,211,153,0.07)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,_rgba(251,191,36,0.06)_0%,_transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 14px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-8">
        <PageHeader balance={game.balance} disabled={game.spinning} onReset={game.reset} />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,430px)_1fr] gap-6 items-start">
          <div className="space-y-4">
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-emerald-950/50 to-slate-950/90 border border-amber-500/15 backdrop-blur p-6 pb-8 shadow-2xl shadow-emerald-950/60">
              <RouletteWheel
                wheel={game.wheel}
                rotation={game.rotation}
                spinning={game.spinning}
                ballAngleDeg={game.ball.angleDeg}
                ballRadius={game.ball.radius}
                ballVisible={game.ball.visible}
                lastResult={game.lastResult?.winningNumber ?? null}
                lastResultColor={game.lastResult?.color ?? null}
              />
              {game.showResult && game.lastResult && (
                <ResultDisplay
                  number={game.lastResult.winningNumber}
                  color={game.lastResult.color}
                  netProfit={game.lastResult.netProfit}
                />
              )}
            </div>

            <HistoryStrip wheel={game.wheel} history={game.history} />
          </div>

          <div className="space-y-4">
            <ChipSelector
              value={game.chipValue}
              onChange={game.setChipValue}
              disabled={game.spinning}
              totalBet={game.stake}
              onClearBets={game.clearBets}
            />

            <BettingTable
              wheel={game.wheel}
              disabled={game.spinning}
              betAmountFor={game.betAmountFor}
              onPlace={game.placeBet}
              onRemove={game.removeBet}
            />

            <ActiveBetsList bets={game.bets} disabled={game.spinning} onRemove={game.removeBet} />

            <SpinButton
              spinning={game.spinning}
              hasBets={game.bets.length > 0}
              totalBet={game.stake}
              onSpin={game.spin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
