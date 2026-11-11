/** Ticket amounts use minor units (cents), never floating-point currency. */
export type TicketOrderSnapshot={
 sourceOrderId:string;
 paidTicketCount:number;
 freeTicketCount:number;
 grossCents:number;
 refundsCents:number;
};
export function summarizeTicketOrders(orders:TicketOrderSnapshot[]){
 const unique=new Map<string,TicketOrderSnapshot>();
 for(const order of orders){
  if(!order.sourceOrderId)throw new Error("Missing source order ID");
  if(![order.paidTicketCount,order.freeTicketCount,order.grossCents,order.refundsCents].every(Number.isSafeInteger))throw new Error("Invalid integer units");
  unique.set(order.sourceOrderId,order);
 }
 return Array.from(unique.values()).reduce((sum,o)=>({
  orders:sum.orders+1,
  paidTickets:sum.paidTickets+o.paidTicketCount,
  freeTickets:sum.freeTickets+o.freeTicketCount,
  grossCents:sum.grossCents+o.grossCents,
  netCents:sum.netCents+o.grossCents-o.refundsCents
 }),{orders:0,paidTickets:0,freeTickets:0,grossCents:0,netCents:0});
}
