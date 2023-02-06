import faker from "@faker-js/faker";
import { generateCPF, getStates } from "@brazilian-utils/brazilian-utils";
import { User } from "@prisma/client";

import { createUser } from "./users-factory";
import { prisma } from "@/config";

export async function createEnrollmentWithAddress(userId?: number) {
  let incomingUser;
  if(!userId) {
    incomingUser = (await createUser());
  }

  return prisma.enrollment.create({
    data: {
      name: faker.name.findName(),
      cpf: generateCPF(),
      birthday: faker.date.past(),
      phone: faker.phone.phoneNumber("(##) 9####-####"),
      userId: userId || incomingUser.id,
      Address: {
        create: {
          street: faker.address.streetName(),
          cep: faker.address.zipCode(),
          city: faker.address.city(),
          neighborhood: faker.address.city(),
          number: faker.datatype.number().toString(),
          state: faker.helpers.arrayElement(getStates()).name,
        },
      },
    },
    include: {
      Address: true,
    },
  });
}

export function createhAddressWithCEP() {
  return {
    logradouro: "Avenida Brigadeiro Faria Lima",
    complemento: "de 3252 ao fim - lado par",
    bairro: "Itaim Bibi",
    cidade: "São Paulo",
    uf: "SP",
  };
}
