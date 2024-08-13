// External Modules
import { add, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useBlock } from "wagmi";

// Internal Modules
import {
  cn,
  formatFloatToBigInt,
  invalidNumberFormat,
  isSimulateContractErrorType,
  negativeNumberValidation,
  nonNumberValidation,
  unParsableNumber,
} from "~/lib/utils";
import { useWriteTroveAuction } from "~/generated";

// Components
import { TimePicker } from "~/components/TimePicker";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { useToast } from "~/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import LoadingPage from "~/components/LoadingPage";
import { useEffect } from "react";

interface CreateAuctionProps {
  decimals: number;
}

export default function CreateAuction({ decimals }: CreateAuctionProps) {
  const { data: blockData } = useBlock();

  // Schema
  const formSchema = z.object({
    auctionId: z.preprocess(
      (args) => (args === "" ? undefined : args),
      z.coerce
        .number({ invalid_type_error: "Auction ID must be a number" })
        .nonnegative("Auction ID must be not be negative"),
    ),
    startDate: z.date(),
    endDate: z.date(),
    startPrice: z
      .string()
      .refine((val) => nonNumberValidation(val), {
        message: "This field must be a number",
      })
      .refine((val) => invalidNumberFormat(val), {
        message: "Invalid number format",
      })
      .refine((val) => unParsableNumber(val), {
        message: "Invalid input",
      })
      .refine((val) => negativeNumberValidation(val), {
        message: "This field must be a positive number",
      }),
    buyoutPrice: z
      .string()
      .refine((val) => nonNumberValidation(val), {
        message: "This field must be a number",
      })
      .refine((val) => invalidNumberFormat(val), {
        message: "Invalid number format",
      })
      .refine((val) => unParsableNumber(val), {
        message: "Invalid input",
      })
      .refine((val) => negativeNumberValidation(val), {
        message: "This field must be a positive number",
      }),
    minimumPrice: z
      .string()
      .refine((val) => nonNumberValidation(val), {
        message: "This field must be a number",
      })
      .refine((val) => invalidNumberFormat(val), {
        message: "Invalid number format",
      })
      .refine((val) => unParsableNumber(val), {
        message: "Invalid input",
      })
      .refine((val) => negativeNumberValidation(val), {
        message: "This field must be a positive number",
      }),
    troveURI: z.string(),
  });

  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      auctionId: 0,
      startDate: new Date(),
      endDate: add(new Date(), { days: 7 }),
      startPrice: "",
      buyoutPrice: "",
      minimumPrice: "",
      troveURI: "",
    },
  });

  // Set the start and end date according to the block timestamp, if available
  // It will fallbacks to using the user's clock if the block timestamp is not available
  useEffect(() => {
    if (blockData) {
      form.setValue("startDate", new Date(Number(blockData.timestamp) * 1000));
      form.setValue("endDate", add(new Date(Number(blockData.timestamp) * 1000), { days: 7 }));
    }
  }, [blockData]);

  // Write auction data to the smart contract
  const writeAuction = useWriteTroveAuction();

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { startDate, endDate, auctionId, startPrice, buyoutPrice, troveURI, minimumPrice } =
      values;

    try {
      const durationSeconds = (endDate.getTime() - startDate.getTime()) / 1000;

      const result = await writeAuction.writeContractAsync({
        functionName: "createAuction",
        args: [
          BigInt(auctionId),
          BigInt(Math.round(startDate.getTime() / 1000)),
          BigInt(Math.round(durationSeconds)),
          formatFloatToBigInt(startPrice, decimals),
          formatFloatToBigInt(buyoutPrice, decimals),
          formatFloatToBigInt(minimumPrice, decimals),
          troveURI,
        ],
      });

      toast({
        title: "Auction created successfully",
        description: `Auction ID: ${auctionId} Created. Transaction hash: ${result}`,
        variant: "success",
      });
      form.reset();
    } catch (error) {
      console.error(error);
      if (isSimulateContractErrorType(error)) {
        if (error.name === "ContractFunctionExecutionError") {
          toast({
            title: "Unable to create auction",
            description: "The create auction transaction will most likely be reverted.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Unable to create auction",
            description: "An error occurred while creating the auction.",
            variant: "destructive",
          });
        }
      }
    }
  }

  if (!blockData) {
    return <LoadingPage />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto mb-8 flex max-w-screen-xl flex-col rounded-2xl bg-dark-blue p-3 sm:p-5"
      >
        <h2 className="overflow-hidden text-ellipsis text-xl sm:text-2xl md:text-3xl lg:text-4xl">
          Create Auction
        </h2>
        <div
          className="my-5 grid auto-rows-auto grid-cols-1 gap-3 sm:grid-cols-2 sm:grid-rows-4 lg:grid-cols-3
            lg:grid-rows-3"
        >
          {/* Auction ID */}
          <FormField
            control={form.control}
            name="auctionId"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-1.5">
                <FormLabel>Auction ID</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage className="!mt-0 text-xs" />
              </FormItem>
            )}
          />
          {/* Start Date */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-1.5">
                <FormLabel>Start Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        id="startDate"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP HH:mm:ss")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={{ before: new Date() }}
                      {...field}
                    />

                    <div className="border-t border-border p-3">
                      <TimePicker date={field.value} setDate={field.onChange} />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage className="!mt-0 text-xs" />
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-1.5">
                <FormLabel>End Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        id="startDate"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP HH:mm:ss")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={{ before: new Date() }}
                      {...field}
                    />

                    <div className="border-t border-border p-3">
                      <TimePicker date={field.value} setDate={field.onChange} />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage className="!mt-0 text-xs" />
              </FormItem>
            )}
          />
          {/* Starting Price */}
          <FormField
            control={form.control}
            name="startPrice"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-1.5">
                <FormLabel>Starting Price</FormLabel>
                <FormControl>
                  <Input placeholder="1000" {...field} />
                </FormControl>
                <FormMessage className="!mt-0 text-xs" />
              </FormItem>
            )}
          />
          {/* Buyout Price */}
          <FormField
            control={form.control}
            name="buyoutPrice"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-1.5">
                <FormLabel>Buyout Price</FormLabel>
                <FormControl>
                  <Input placeholder="20000" {...field} />
                </FormControl>
                <FormMessage className="!mt-0 text-xs" />
              </FormItem>
            )}
          />
          {/* Minimum increment Price */}
          <FormField
            control={form.control}
            name="minimumPrice"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-1.5">
                <FormLabel>Minimum Increment Price</FormLabel>
                <FormControl>
                  <Input placeholder="100" {...field} />
                </FormControl>
                <FormMessage className="!mt-0 text-xs" />
              </FormItem>
            )}
          />
          {/* Trove NFT URI */}
          <FormField
            control={form.control}
            name="troveURI"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                <FormLabel>Starting Price</FormLabel>
                <FormControl>
                  <Input placeholder="354.png" {...field} />
                </FormControl>
                <FormMessage className="!mt-0 text-xs" />
              </FormItem>
            )}
          />
        </div>
        <ol className="list-inside list-decimal">
          <li>
            It is recommended that the <code>Auction ID</code> should match the filename of the{" "}
            <code>Trove NFT URI</code>
          </li>
          <li>
            You can set the <code>Start Time</code> of the auction in the future to have the auction
            appear first and start in the future
          </li>
        </ol>
        <Button type="submit" className="mt-5 max-w-40">
          Create Auction
        </Button>
      </form>
    </Form>
  );
}
