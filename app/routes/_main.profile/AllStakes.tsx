// Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function AllStakes() {
  return (
    <article className="pt-2">
      <Card className="rounded-3xl bg-dark-blue">
        <CardHeader className="flex-row items-center pb-2 pt-4">
          <CardDescription>Stakes #0</CardDescription>
          <Badge className="ml-auto" variant="success">
            Active
          </Badge>
        </CardHeader>
        <CardContent className="mx-2 mb-2 rounded-2xl bg-accent-dark-blue p-4">
          <div className="text-amber-500">
            <p className="mb-1 font-light">Staked</p>
            <CardTitle className="text-5xl">3,000</CardTitle>
          </div>
          <p className="mt-3 font-light">Total Rewards</p>
          <h4 className="text-4xl">1,200</h4>
          <p className="-mt-1 text-slate-400">
            <small>TRV2</small>
          </p>

          <div className="mt-3 text-sm sm:text-base">
            <p>
              <span className="font-light text-slate-400">Claimed:</span> {300} TRV2
            </p>
            <p>
              {" "}
              <span className="font-light text-slate-400">Starts:</span> {"Jun 02 2024 10:30AM"}
            </p>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
