import { EntityManager } from '@mikro-orm/core';
import { em } from "../index"
import QuestionEntity from "../entities/Question"
import faker from "faker"
import chalk from "chalk"
import { DEV } from "../global"
import { hash } from "argon2"
import { User } from "../entities/User"
import QuestionManager from "../game/QuestionManager"

export default async function setupDefaults() {
  const manager = em.fork()
  // This will run a setup query to provide us with fake data in development
  let count = await manager.count(User)
  if (DEV && count < 1000) {
    console.log(chalk.magenta("Generate test data... Please wait..."))
    for (let i = 0; i < 1000 - count; i++) {
      const name = faker.name.findName()
      const email = faker.internet.email().toLowerCase()
      const password = await hash(faker.internet.password())
      manager.persist(new User(name, email, password))
    }
    await manager.flush()
  }

  if (!(await manager.count(QuestionEntity))) {
    console.log(chalk.magenta("Generate default question set..."))
    createDefaultQuestionPool(manager) 
  }
}

async function createDefaultQuestionPool(manager: EntityManager) {
  await QuestionManager.addAll(
    manager,
    [
        "Hello",
        [
          "Cómo estás",
          "Hola",
          "Adiós",
          "Noche"
        ],
        1,
        "es"
    ],
    [
        "Goodbye",
        [
          "Adiós",
          "Cómo estás",
          "Hola",
          "Noche"
        ],
        0,
        "es"
    ],
    [
        "Look over there",
        [
          "Mirar",
          "Punto",
          "Mira allá",
          "Por ahí"
        ],
        2,
        "es"
    ],
    [
        "How are you",
        [
          "Cómo estás",
          "Quién eres tú",
          "Dónde estás",
          "Por qué"
        ],
        1,
        "es"
    ],
    [
        "Day",
        [
          "Día",
          "Noche",
          "Mediodía",
          "Medianoche"
        ],
        0,
        "es"
    ],
    [
        "Night",
        [
          "Día",
          "Mediodía",
          "Noche",
          "Medianoche"
        ],
        2,
        "es"
    ],
    [
        "The weather is sunny today",
        [
          "El clima es promedio",
          "El clima es genial",
          "El clima esta soleado hoy",
          "El clima es terrible"
        ],
        2,
        "es"
    ],
    [
        "Jacob invited us over for dinner",
        [
          "Jacob nos invitó a cenar"
        ],
        0,
        "es"
    ],
    [
        "Which one would you like?",
        [
          "¿Estás seguro de que quieres eso?",
          "¿Quieres ese?",
          "¿Éste?",
          "¿Cuál te gustaría?"
        ],
        3,
        "es"
    ],
    [
        "Thank you",
        [
          "Lo aprecio",
          "Gracias",
          "No quiero esto",
          "Por favor"
        ],
        1,
        "es"
    ],
    [
        "No thank you",
        [
          "No gracias",
          "Por favor no",
          "Quiero esto",
          "Por favor no me des esto"
        ],
        0,
        "es"
    ],
    [
        "She wants to see a movie",
        [
          "Puedes ir al cine",
          "Quiere visitar el teatro",
          "No quiero ver una pelicula",
          "Ella quiere ver una pelicula"
        ],
        3,
        "es"
    ],
    [
        "It's getting late",
        [
          "Es muy temprano",
          "Es casi mediodía",
          "Que hora es",
          "Se está haciendo tarde"
        ],
        3,
        "es"
    ],
    [
        "What would you like for dinner?",
        [
          "¿Qué te gustaría?",
          "¿Qué te gustaría para el desayuno?",
          "¿Qué te gustaría para cenar?",
          "¿Quieres esto?"
        ],
        2,
        "es"
    ],
    [
        "Beans",
        [
          "Maíz",
          "Frijoles",
          "Fruta",
          "Harina"
        ],
        1,
        "es"
    ],
    [
        "Meat",
        [
          "Huevo",
          "Leche",
          "Carne",
          "Especias"
        ],
        2,
        "es"
    ],
    [
        "Summer vacation is about to begin",
        [
          "Las vacaciones de verano están a punto de comenzar",
          "Las vacaciones de primavera casi terminan",
          "El invierno llegará pronto",
          "El otoño casi termina"
        ],
        0,
        "es"
    ],
    [
        "I will soon be graduating",
        [
          "Pronto me graduaré",
          "Pronto seré libre",
          "La escuela comenzará de nuevo",
          "Pronto estaré fuera de la escuela"
        ],
        0,
        "es"
    ],
    [
        "Sleepy",
        [
          "Estresado",
          "Cansado",
          "Exhausto",
          "Somnoliento"
        ],
        3,
        "es"
    ],
    [
        "Stressed",
        [
          "Cansado",
          "Somnoliento",
          "Estresado",
          "Exhausto"
        ],
        2,
        "es"
    ]
  )
  await manager.flush()
}
