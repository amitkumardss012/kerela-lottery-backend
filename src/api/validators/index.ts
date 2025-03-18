import { ZodError } from "zod";
import LotteryValidator, { LotteryType } from "./lottery.validator";
import AdminValidator, { AdminType } from "./admin.validator";
import TicketPackageValidator, {
  TicketPackageType,
} from "./ticketPackage.validator";
import WinnerValdator, { WinnerType } from "./winner.validator";
import EnquiryValidator, { EnquiryType } from "./enquiry.validator";
import BuyerValidator, { BuyerType } from "./buyer.validator";

export {
  zodError,
  AdminValidator,
  AdminType,
  LotteryValidator,
  LotteryType,
  TicketPackageValidator,
  TicketPackageType,
  WinnerValdator,
  WinnerType,
  EnquiryValidator,
  EnquiryType,
  BuyerValidator,
  BuyerType,
};

const zodError = (error: ZodError) => {
  let errors: any = {};
  error.errors.map((issue) => {
    const path = issue.path?.[0];
    if (path) errors[path] = issue.message;
  });
  return errors;
};
