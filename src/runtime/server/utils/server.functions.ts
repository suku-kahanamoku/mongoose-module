import mongoose from "mongoose";

/**
 * @function _connect
 * @description
 * Připojuje se k MongoDB pomocí Mongoose. Používá proměnné prostředí pro konfiguraci připojení.
 *
 * @returns {Promise<void>} Vrací `Promise`, která je vyřešena po úspěšném připojení.
 *
 * @example
 * await _connect();
 * console.log("Connected to MongoDB.");
 */
const _connect = async (): Promise<void> => {
  /*  const url = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`; */
  const url = `mongodb+srv://${process.env.MONGO_ADM_USER}:${process.env.MONGO_ADM_PASS}@${process.env.MONGO_HOST}/?retryWrites=true&w=majority&appName=Test`;
  console.log("MongoDB connecting...");
  await mongoose.connect(process.env.MONGO_DATABASE_URI || url, {
    dbName: process.env.MONGO_DB,
  });
};

/**
 * @function GET_STATUS
 * @description
 * Vrací aktuální stav připojení k MongoDB.
 *
 * @returns {mongoose.ConnectionStates} Stav připojení k MongoDB.
 *
 * @example
 * const status = GET_STATUS();
 * console.log(status); // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export const GET_STATUS = (): mongoose.ConnectionStates => {
  return mongoose.connection.readyState;
};

/**
 * @function CONNECT_WITH_RETRY
 * @description
 * Pokouší se připojit k MongoDB s automatickým opakováním v případě selhání.
 * Pokud připojení selže, pokusí se znovu připojit po 5 sekundách.
 *
 * @returns {Promise<void>} Vrací `Promise`, která je vyřešena po úspěšném připojení nebo po vyčerpání pokusů.
 *
 * @example
 * await CONNECT_WITH_RETRY();
 * console.log("Connected to MongoDB.");
 */
export const CONNECT_WITH_RETRY = async (): Promise<void> => {
  try {
    await _connect();
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.log("Cannot connect to MongoDB! Retrying in 5 seconds...");
    setTimeout(async () => {
      try {
        await _connect();
        console.log("Connected to MongoDB.");
      } catch (dbError) {
        console.log(
          "Cannot connect to MongoDB! Connection was not established."
        );
      }
    }, 5000);
  }
};
