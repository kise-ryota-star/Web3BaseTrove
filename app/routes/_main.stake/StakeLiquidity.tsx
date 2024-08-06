export default function StakeLiquidity() {
  return (
    <article className="mx-auto my-14 flex max-w-screen-lg flex-col sm:px-4">
      <div className="w-full">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl md:text-4xl">
          Your token is still liquid
        </h2>
        <div
          className="mx-auto mb-1 mt-10 flex max-w-4xl grid-cols-5 grid-rows-3 flex-col gap-x-10 px-3 sm:mb-0 sm:grid
            sm:gap-y-6"
        >
          <h3 className="col-span-2 text-xl !leading-relaxed text-amber-500 md:text-2xl">
            Instant Rewards, Anytime Access - Stake with Freedom!
          </h3>
          <p className="col-span-3 mb-6 !leading-relaxed sm:mb-0">
            Stake your token, mint rewards, and stay in control! Enjoy liquid staking with no
            lock-up period. Unstake anytime, no strings attached. Start earning rewards your way
            today!
          </p>

          <h3 className="col-span-2 mb-1 text-xl !leading-relaxed text-amber-500 sm:mb-0 md:text-2xl">
            Daily claimable quota
          </h3>
          <p className="col-span-3 mb-6 !leading-relaxed sm:mb-0">
            Calculated from the time of the smart contract deployment, only 15,000 tokens can be
            claimed every 24 hours. Don’t sweat, your rewards are not going anywhere, you can always
            claim later.
          </p>

          <h3 className="col-span-2 mb-1 text-xl !leading-relaxed text-amber-500 sm:mb-0 md:text-2xl">
            Earned rewards will always be yours
          </h3>
          <div className="col-span-3 !leading-relaxed">
            <p>
              What happen when you unstake without claiming your remaining rewards? Your rewards
              will deposit to you automatically!
            </p>
            <br />
            <p>
              However, if the daily quota has met, then you need to claim the rewards yourself with
              a click of a button at the profile page
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
