// src/components/Results.js

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { firestore } from '../firebaseConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const colorNames = [
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Purple',
  'Orange',
  'Pink',
  'Brown',
  'Black',
  'White',
];
const emotionalLabels = ['Happy', 'Sad', 'Frustrated', 'Neutral', 'Empowered'];

const Results = () => {
  const { workshopId } = useParams();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [emotionalData, setEmotionalData] = useState({
    labels: emotionalLabels,
    datasets: [],
  });
  const [numParticipants, setNumParticipants] = useState(0);

  useEffect(() => {
    const fetchAnswers = () => {
      const answersCollection = collection(firestore, `workshops/${workshopId}/answers`);
      return onSnapshot(answersCollection, (snapshot) => {
        const answers = snapshot.docs.map((doc) => doc.data());
        console.log('Raw answers data:', answers);
        formatChartData(answers);
        formatEmotionalData(answers);
      });
    };

    const generateReadableLabel = (index) => colorNames[index % colorNames.length];

    const formatChartData = (answers) => {
      const stepData = {};
      let participantIndex = 0;
      const participantMap = {};

      answers.forEach((doc) => {
        const { participantId, answers: participantAnswers } = doc;
        console.log('Processing answer:', doc);
        if (!participantId || !participantAnswers) {
          console.warn('Invalid answer data:', doc);
          return;
        }

        if (!stepData[participantId]) {
          stepData[participantId] = { forward: 0, backward: 0 };
          participantMap[participantId] = generateReadableLabel(participantIndex++);
        }

        participantAnswers.forEach((answer) => {
          const { step } = answer;
          if (step === 'forward') {
            stepData[participantId].forward++;
          } else if (step === 'backward') {
            stepData[participantId].backward++;
          }
        });
      });

      console.log('Step data:', stepData);

      const labels = Object.keys(stepData).map((id) => participantMap[id]);
      const forwardData = Object.keys(stepData).map((id) => stepData[id].forward);
      const backwardData = Object.keys(stepData).map((id) => stepData[id].backward);

      console.log('Labels:', labels);
      console.log('Forward data:', forwardData);
      console.log('Backward data:', backwardData);

      setNumParticipants(labels.length);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Steps Forward',
            data: forwardData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderWidth: 1,
          },
          {
            label: 'Steps Backward',
            data: backwardData,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderWidth: 1,
          },
        ],
      });
    };

    const formatEmotionalData = (answers) => {
      const emotionCounts = emotionalLabels.reduce((acc, label) => {
        acc[label] = 0;
        return acc;
      }, {});

      answers.forEach((doc) => {
        const { emotionalFeedback } = doc;
        if (emotionalFeedback && emotionCounts.hasOwnProperty(emotionalFeedback)) {
          emotionCounts[emotionalFeedback]++;
        }
      });

      const data = {
        labels: emotionalLabels,
        datasets: [
          {
            label: 'Emotional Feedback',
            data: emotionalLabels.map((label) => emotionCounts[label]),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
          },
        ],
      };

      setEmotionalData(data);
    };

    const unsubscribe = fetchAnswers();
    return () => unsubscribe();
  }, [workshopId]);

  return (
    <div className="container mt-5">
      <h1 className="text-center">Questionnaire Results</h1>
      <h2 className="text-center mb-4">Number of Participants: {numParticipants}</h2>
      <div className="mb-5" style={{ position: 'relative', width: '100%', height: '500px' }}>
        <Bar
          data={chartData}
          options={{
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Number of Steps',
                },
                beginAtZero: true,
              },
              y: {
                title: {
                  display: true,
                  text: 'Participants',
                },
              },
            },
          }}
        />
      </div>
      <div style={{ position: 'relative', width: '100%', height: '500px', marginTop: '50px' }}>
        <Line
          data={emotionalData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Emotions',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Count',
                },
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Results;
