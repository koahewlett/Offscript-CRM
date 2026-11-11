import {describe,it,expect} from "vitest";
import {summarizeTicketOrders} from "./finance";
describe("ticket snapshot calculations",()=>{
 it("counts tickets, not orders",()=>{
  expect(summarizeTicketOrders([{sourceOrderId:"one",paidTicketCount:3,freeTicketCount:1,grossCents:9000,refundsCents:0}]))
   .toEqual({orders:1,paidTickets:3,freeTickets:1,grossCents:9000,netCents:9000});
 });
 it("keeps only latest snapshot when order is repeated",()=>{
  const result=summarizeTicketOrders([
   {sourceOrderId:"one",paidTicketCount:3,freeTicketCount:0,grossCents:9000,refundsCents:0},
   {sourceOrderId:"one",paidTicketCount:3,freeTicketCount:0,grossCents:9000,refundsCents:3000}
  ]);
  expect(result.orders).toBe(1);expect(result.netCents).toBe(6000);
 });
 it("rejects fractional cents",()=>{
  expect(()=>summarizeTicketOrders([{sourceOrderId:"one",paidTicketCount:1,freeTicketCount:0,grossCents:1.5,refundsCents:0}])).toThrow();
 });
});
