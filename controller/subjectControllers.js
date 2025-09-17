const Subject = require('../model/subjectModel.js')

// add subject
const addSubject = async(req, res) => {
    const { 
        subject, theory, revision,
        pyq, testSeries, isCompleted, noOfLectures,
        noOfLecturesCompleted, subjectStart, subjectEnd
     } = req.body

     try{
        const newSubject = new Subject({
            user: req.user._id,
            subject, theory, revision,
            pyq, testSeries, isCompleted, noOfLectures,
            noOfLecturesCompleted, subjectStart, subjectEnd
        })

        await newSubject.save()
        res.status(200).json(newSubject)


     }catch(error){
        console.error('not able to add subject', error)
        res.status(500).json({message: 'not able to add subject'})
     }
}

// get subject
const getSubject = async(req, res) => {
   try{
        const subjectInfo = await Subject.find({ user: req.user._id });
        if(!subjectInfo){
            return res.status(400).json({message: "subject not found"})
        }
        return res.status(200).json({
            message: "Sunject information found",
            subjectInfo
        })

   }catch(error){
        console.error('not able to fetch subject data', error)
        res.status(500).json({message: "not able to fetch data"})
   }
}

// delete subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ message: "subject not found" });

    // ✅ check ownership or role
    if (subject.user.toString() !== req.user._id.toString() && req.user.role === "user") {
      return res.status(403).json({ message: "Not allowed to delete this subject" });
    }

    await subject.deleteOne();
    res.status(200).json({ message: "subject deleted successfully" });
  } catch (error) {
    console.error('not able to delete subject', error);
    res.status(500).json({ message: "not able to delete subject" });
  }
};



// update subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subject,
      theory,
      revision,
      pyq,
      testSeries,
      isCompleted,
      noOfLectures,
      noOfLecturesCompleted,
      subjectStart,
      subjectEnd,
    } = req.body;

    const subjectName = await Subject.findById(id);
    if (!subjectName) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // 🚫 Only block if it's a USER trying to modify someone else's subject
    if (
      req.user.role === "user" &&
      subjectName.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not allowed to update this subject" });
    }

    // ✅ Update fields if provided
    if (subject !== undefined) subjectName.subject = subject;
    if (theory !== undefined) subjectName.theory = theory;
    if (revision !== undefined) subjectName.revision = revision;
    if (pyq !== undefined) subjectName.pyq = pyq;
    if (testSeries !== undefined) subjectName.testSeries = testSeries;
    if (isCompleted !== undefined) subjectName.isCompleted = isCompleted;
    if (noOfLectures !== undefined) subjectName.noOfLectures = noOfLectures;
    if (noOfLecturesCompleted !== undefined)
      subjectName.noOfLecturesCompleted = noOfLecturesCompleted;
    if (subjectStart !== undefined) subjectName.subjectStart = subjectStart;
    if (subjectEnd !== undefined) subjectName.subjectEnd = subjectEnd;

    const updatedSubject = await subjectName.save();

    return res.status(200).json({
      message: "Subject updated successfully",
      updatedSubject,
    });
  } catch (error) {
    console.error("Not able to update", error);
    res.status(500).json({ message: "Not able to update" });
  }
};



// get one subject by id
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // 🚫 Restrict USER to only their own subjects
    if (
      req.user.role === "user" &&
      subject.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not allowed to view this subject" });
    }

    return res.status(200).json({
      message: "Subject fetched successfully",
      subject,
    });
  } catch (error) {
    console.error("Error fetching subject", error);
    res.status(500).json({ message: "Error fetching subject" });
  }
};



module.exports = { addSubject, getSubject, deleteSubject, updateSubject, getSubjectById}