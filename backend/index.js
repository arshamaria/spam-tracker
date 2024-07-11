const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const SpamReport = require('./model/spamReports');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true
}));

mongoose.connect('mongodb://localhost:27017/spam-reporting', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Connection error:', err);
  });

app.post('/api/report-sms', async (req, res) => {
  try {
    const reportDataArray = req.body; // assuming it's an array of report data objects
    const reportPromises = reportDataArray.map(reportData => {
      const { phone_number, message, device_id } = reportData;
      if (!phone_number) {
        throw new Error('phone_number is required');
      }
      if (!device_id) {
        throw new Error('device_id is required');
      }
      const newReport = new SpamReport({
        type: 'SMS',
        phone_number,
        message,
        device_id,
        report_time: new Date(),
      });
      return newReport.save();
    });

    const savedReports = await Promise.all(reportPromises);
    res.status(201).json(savedReports);
  } catch (err) {
    console.error('Error reporting SMS:', err);
    res.status(500).json({ error: 'Failed to report' });
  }
});

app.post('/api/report-call', async (req, res) => {
  try {
    const reportDataArray = req.body; // assuming it's an array of report data objects
    const reportPromises = reportDataArray.map(reportData => {
      const { phone_number, call_info, call_duration, device_id } = reportData;
      if (!phone_number) {
        throw new Error('phone_number is required');
      }
      if (!device_id) {
        throw new Error('device_id is required');
      }
      const newReport = new SpamReport({
        type: 'Call',
        phone_number,
        call_info,
        call_duration,
        device_id,
        report_time: new Date(),
      });
      return newReport.save();
    });

    const savedReports = await Promise.all(reportPromises);
    res.status(201).json(savedReports);
  } catch (err) {
    console.error('Error reporting call:', err);
    res.status(500).json({ error: 'Failed to report' });
  }
});

app.get('/api/report-history/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const reports = await SpamReport.find({ device_id });
    res.status(200).json(reports);
  } catch (err) {
    console.error('Error fetching report history:', err);
    res.status(500).json({ error: 'Failed to fetch report history' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});