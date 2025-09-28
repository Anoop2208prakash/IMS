import api from './api';

interface NewCourseData {
  title: string;
  description: string;
  courseCode: string;
  credits: number;
}

export const getCourses = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/courses', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createCourse = async (courseData: NewCourseData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/courses', courseData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};