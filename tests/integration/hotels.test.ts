import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createEnrollmentWithAddress, createUser, createTicketType, createTicket } from "../factories";
import { createHotel } from "../factories/hotels-factory";
import { createRoom } from "../factories/rooms-factory";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with 404 when ticket doesn't exist", async () => {
      const token = await generateValidToken();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with 402 when ticket is not paid", async () => {
      type JWTPayload = {
        userId: number;
      };

      const token = await generateValidToken();
      const { userId } = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      const enrollment = await createEnrollmentWithAddress(userId);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, "RESERVED");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with empty array when there are no hotels created", async () => {
      type JWTPayload = {
        userId: number;
      };

      const token = await generateValidToken();
      const { userId } = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      const enrollment = await createEnrollmentWithAddress(userId);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.body).toEqual([]);
    });

    it("should respond with empty array when there are no hotels created", async () => {
      type JWTPayload = {
        userId: number;
      };

      const token = await generateValidToken();
      const { userId } = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      const enrollment = await createEnrollmentWithAddress(userId);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.body).toEqual([]);
    });

    it("should respond with status 200 and with existing hotels data", async () => {
      type JWTPayload = {
        userId: number;
      };

      const token = await generateValidToken();
      const { userId } = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      const enrollment = await createEnrollmentWithAddress(userId);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, "PAID");

      const hotel = await createHotel();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
        },
      ]);
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with 404 when ticket doesn't exist", async () => {
      const token = await generateValidToken();

      const hotel = await createHotel();
      await createRoom(hotel.id);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with 402 when ticket is not paid", async () => {
      type JWTPayload = {
        userId: number;
      };

      const token = await generateValidToken();
      const { userId } = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      const enrollment = await createEnrollmentWithAddress(userId);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, "RESERVED");

      const hotel = await createHotel();
      await createRoom(hotel.id);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 404 if the hotel doesn't exist", async () => {
      type JWTPayload = {
        userId: number;
      };

      const token = await generateValidToken();
      const { userId } = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      const enrollment = await createEnrollmentWithAddress(userId);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, "PAID");

      const response = await server.get("/hotels/0").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and with the hotel data", async () => {
      type JWTPayload = {
        userId: number;
      };

      const token = await generateValidToken();
      const { userId } = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      const enrollment = await createEnrollmentWithAddress(userId);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, "PAID");

      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        {
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: [
            {
              id: room.id,
              name: room.name,
              capacity: room.capacity,
              hotelId: room.hotelId,
              createdAt: room.createdAt.toISOString(),
              updatedAt: room.updatedAt.toISOString(),
            }
          ]
        },
      );
    });
  });
});
