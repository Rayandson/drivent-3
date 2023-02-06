import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { Room, Hotel } from "@prisma/client";
import { createHotel } from "./hotels-factory";

export async function createRoom(hotelId?: number): Promise<Room> {
  let hotel: Hotel;
  if(!hotelId) {
    hotel = await createHotel();
  }

  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: Number(faker.random.numeric()),
      hotelId: hotelId || hotel.id
    },
  });
}
