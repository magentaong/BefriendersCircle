const Training = require("../models/Training");

async function getTrainingByCIDAndTitle(cID, title) {
  if (!cID || !title) {
    const error = new Error("Missing cID or title query parameters.");
    error.status = 400;
    throw error;
  }

  const training = await Training.findOne({ cID, title });
  if (!training) {
    const error = new Error("Training not found.");
    error.status = 404;
    throw error;
  }
  return training;
}

async function updateTraining(tID, updateData) {
  const updatedTraining = await Training.findOneAndUpdate(
    { tID },
    updateData,
    { new: true }
  );

  if (!updatedTraining) {
    const error = new Error("Training not found.");
    error.status = 404;
    throw error;
  }
  return updatedTraining;
}

async function createTraining({ tID, cID, title, coverImg }) {
  if (!cID || !tID || !title) {
    const error = new Error("Missing required fields.");
    error.status = 400;
    throw error;
  }

  const existing = await Training.findOne({ cID, title });
  if (existing) {
    return { exists: true, training: existing };
  }

  const newTraining = new Training({
    tID,
    cID,
    title,
    coverImg: coverImg || null,
    status: false,
    progress: 0,
  });

  const saved = await newTraining.save();
  return { exists: false, training: saved };
}

module.exports = {getTrainingByCIDAndTitle,updateTraining, createTraining,
};
