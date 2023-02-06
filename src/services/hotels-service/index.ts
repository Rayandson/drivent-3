import { notFoundError } from "@/errors";
import { paymentRequiredError } from "@/errors/payment-required.error";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";

export async function getHotels(userId: number) {
  const  ticket = await ticketRepository.findTicketByUserId(userId);

  if(!ticket) {
    throw notFoundError();
  }

  if(ticket.status !== "PAID" || ticket.TicketType.includesHotel === false) {
    throw paymentRequiredError();
  }
  
  const hotels = await hotelRepository.findHotels();

  return hotels;
}

export async function getHotelWithRooms(userId: number, hotelId: number) {
  const  ticket = await ticketRepository.findTicketByUserId(userId);

  if(!ticket) {
    throw notFoundError();
  }

  if(ticket.status !== "PAID" || ticket.TicketType.includesHotel === false) {
    throw paymentRequiredError();
  }
  
  const hotel = await hotelRepository.findHotelById(hotelId);

  if(!hotel) {
    throw notFoundError();
  }

  return hotel;
}

const hotelService = {
  getHotels,
  getHotelWithRooms
};
  
export default hotelService;
