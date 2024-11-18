import * as SQLite from 'expo-sqlite';

const dbPromise = SQLite.openDatabaseAsync('garden.db');

// Initialize the database
export const createTable = async () => {
  const db = await dbPromise;

  // Create the new table with the updated schema
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      uri TEXT,
      species TEXT,
      description TEXT,
      watering TEXT,
      poisonousToHumans TEXT,
      poisonousToPets TEXT,
      scientificName TEXT,
      family TEXT,
      sunlight TEXT,
      additionalCareTips TEXT,
      watering_schedule TEXT,   -- Added watering_schedule field as TEXT to store JSON
      user_schedule TEXT,   -- Added user_schedule field
      lastWatered TIMESTAMP,     -- Added lastWatered field
      whereToBuy TEXT        --Added a whereToBuy field
    );
  `);

  // Create the watering_schedules table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS watering_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER,
      spring_summer TEXT,
      fall_winter TEXT,
      FOREIGN KEY (plant_id) REFERENCES images(id) ON DELETE CASCADE
    );
  `);
};

// Function to drop all tables
export const dropTables = async () => {
  const db = await dbPromise;

  // Drop the images table
  await db.execAsync('DROP TABLE IF EXISTS images;');

  // Drop the watering_schedules table
  await db.execAsync('DROP TABLE IF EXISTS watering_schedules;');
};

/* 
WARNING: This will delete all data in the database
*/

//dropTables();



// Insert an image into the database
// Modify your insertImage function to include watering_schedule:
export const insertImage = async (
  name: string,
  uri: string,
  species: string,
  description: string,
  watering: string,
  poisonousToHumans: string,
  poisonousToPets: string,
  scientificName: string,
  family: string,
  sunlight: string,
  additionalCareTips: string,
  watering_schedule?: { spring_summer?: string; fall_winter?: string },
  user_schedule?: { spring_summer?: string; fall_winter?: string },
  lastWatered?: string, // Add lastWatered parameter
  whereToBuy: string
): Promise<number> => {
  const db = await dbPromise;

  // Convert schedules to JSON strings
  const wateringScheduleJSON = watering_schedule ? JSON.stringify(watering_schedule) : null;
  const userScheduleJSON = user_schedule ? JSON.stringify(user_schedule) : wateringScheduleJSON;

  // Insert the image and get the result
  const result = await db.runAsync(
    `INSERT INTO images (
      name,
      uri,
      species,
      description,
      watering,
      poisonousToHumans,
      poisonousToPets,
      scientificName,
      family,
      sunlight,
      additionalCareTips,
      watering_schedule,
      user_schedule,
      lastWatered,
      whereToBuy
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      name,
      uri,
      species,
      description,
      watering,
      poisonousToHumans,
      poisonousToPets,
      scientificName,
      family,
      sunlight,
      additionalCareTips,
      wateringScheduleJSON,
      userScheduleJSON,
      lastWatered || null, // Use provided lastWatered or set to null
      whereToBuy
    ]
  );

  // Get the last inserted ID
  const { insertId } = result;
  return insertId;
};

// Get all images from the database
// Modify your getImages function as follows:

export const getImages = async (callback: (images: {
  id: number,
  name: string,
  uri: string,
  species: string,
  description: string,
  watering: string,
  poisonousToHumans: string,
  poisonousToPets: string,
  scientificName: string,
  family: string,
  sunlight: string,
  additionalCareTips: string,
  watering_schedule?: { spring_summer?: string; fall_winter?: string },
  user_schedule?: { spring_summer?: string; fall_winter?: string }, // Include user_schedule
  lastWatered: string | null,
  whereToBuy: string
}[]) => void) => {
  const db = await dbPromise;
  const rows = await db.getAllAsync('SELECT * FROM images;');
  const images = rows.map(row => ({
    id: row.id,
    name: row.name,
    uri: row.uri,
    species: row.species,
    description: row.description,
    watering: row.watering,
    poisonousToHumans: row.poisonousToHumans,
    poisonousToPets: row.poisonousToPets,
    scientificName: row.scientificName,
    family: row.family,
    sunlight: row.sunlight,
    additionalCareTips: row.additionalCareTips,
    watering_schedule: row.watering_schedule ? JSON.parse(row.watering_schedule) : undefined,
    user_schedule: row.user_schedule ? JSON.parse(row.user_schedule) : undefined, // Parse user_schedule
    lastWatered: row.lastWatered || null,
    whereToBuy: row.whereToBuy,
  }));
  callback(images);
};
/**
 * Update the lastWatered field for a plant in the database
 * @param id 
 * @param lastWateredDate 
 */
export const updateLastWatered = async (id: number, lastWateredDate: string) => {
  const db = await dbPromise;
  try {
    await db.runAsync('UPDATE images SET lastWatered = ? WHERE id = ?;', [lastWateredDate, id]);
    console.log(`Updated lastWatered for plant ID ${id}`);
    return true;
  } catch (error) {
    console.error("Failed to update lastWatered:", error);
    return false;
  }
};

export const updateUserSchedule = async (
  id: number,
  user_schedule: { spring_summer?: string; fall_winter?: string }
) => {
  const db = await dbPromise;
  const userScheduleJSON = JSON.stringify(user_schedule);

  try {
    await db.runAsync('UPDATE images SET user_schedule = ? WHERE id = ?;', [
      userScheduleJSON,
      id,
    ]);
    console.log(`Updated user_schedule for plant ID ${id}`);
    return true;
  } catch (error) {
    console.error('Failed to update user_schedule:', error);
    return false;
  }
};

// Update a plant's name in the database
export const updatePlantName = async (id: number, newName: string) => {
  const db = await dbPromise;
  try {
    await db.runAsync('UPDATE images SET name = ? WHERE id = ?;', [newName, id]);
    console.log(`Successfully updated plant with ID ${id} to new name: ${newName}`);
    return true; // Return true if the update was successful
  } catch (error) {
    console.error("Failed to update plant name:", error);
    return false; // Return false if there was an error
  }
};
//update the plant picture
export const updatePlantImage = async (id: number, newUri: string) => {
  const db = await dbPromise;
  try {
    await db.runAsync('UPDATE images SET uri = ? WHERE id = ?;', [newUri, id]);
    console.log(`Successfully updated plant with ID ${id} to new image URI: ${newUri}`);
    return true;
  } catch (error) {
    console.error("Failed to update plant image:", error);
    return false;
  }
};


// Delete an image from the database
// Delete an image from the database
export const deleteImage = async (id: number) => {
  const db = await dbPromise;
  await db.runAsync('DELETE FROM images WHERE id = ?;', [id]);
};


// Check the table schema
export const checkTableSchema = async () => {
  const db = await dbPromise;
  const result = await db.getAllAsync('PRAGMA table_info(images);');
  console.log(result);
};

// Call createTable to ensure the table is created
createTable();
