export const getProfile = (req, res) => {
  try {
    const admin = req.admin;

    res
      .status(200)
      .json({ message: "Admin Profile retreived successfully", admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
