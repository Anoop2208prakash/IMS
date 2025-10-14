import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import styles from './NewAdmissionPage.module.scss';
import logo from '../../../assets/logo.png'; // Make sure you have a logo file in your assets

interface Course {
  id: string;
  title: string;
}

const NewAdmissionPage = () => {
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: 'MALE',
    
    // Address Details
    presentAddressDivision: '',
    presentAddressDistrict: '',
    presentAddressDetails: '',
    permanentAddressDivision: '',
    permanentAddressDistrict: '',
    permanentAddressDetails: '',

    // Other Info
    religion: '',
    nationality: 'Indian', // Default value
    phoneNumber: '',
    email: '',
    nidNumber: '',
    bloodGroup: '',
    occupation: '',
    maritalStatus: 'SINGLE',
    courseId: '',
    password: '123', // Add a temporary password if needed for the backend
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch available courses for the dropdown
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses');
        setCourses(response.data);
      } catch (err) {
        setError('Failed to load courses. Please try again.');
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!imageFile) {
      setError('Please upload a student photo.');
      return;
    }

    const submissionData = new FormData();
    // Consolidate addresses for easier backend processing if needed
    submissionData.append('presentAddress', `${formData.presentAddressDetails}, ${formData.presentAddressDistrict}, ${formData.presentAddressDivision}`);
    submissionData.append('permanentAddress', `${formData.permanentAddressDetails}, ${formData.permanentAddressDistrict}, ${formData.permanentAddressDivision}`);
    
    // Append all other text fields
    Object.entries(formData).forEach(([key, value]) => {
      // Avoid appending the separate address fields again
      if (!key.toLowerCase().includes('addressd')) {
         submissionData.append(key, value);
      }
    });

    submissionData.append('image', imageFile);

    try {
      await axios.post('http://localhost:5000/api/students', submissionData);
      
      setMessage(`Student "${formData.fullName}" admitted successfully!`);
      // Optionally reset the form here

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to admit student.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <form onSubmit={handleSubmit} className={styles.admissionForm}>
        {/* Angled Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logoArea}>
              <img src={logo} alt="Complex Academy Logo" className={styles.logo} />
              <div>
                <h1>COMPLEX ACADEMY</h1>
                <p>Another Way to Education</p>
              </div>
            </div>
            <div className={styles.photoBox} onClick={() => document.getElementById('photoUpload')?.click()}>
              {imagePreview ? <img src={imagePreview} alt="Student Preview" /> : 'PHOTO'}
              <input 
                id="photoUpload"
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleImageChange}
                style={{ display: 'none' }}
                required
              />
            </div>
          </div>
          <h2>ADMISSION FORM</h2>
        </div>

        {/* Form Body */}
        <div className={styles.formBody}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Student's Name</label><input type="text" name="fullName" onChange={handleChange} required /></div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Father's Name</label><input type="text" name="fatherName" onChange={handleChange} required /></div>
            <div className={styles.formGroup}><label>Mother's Name</label><input type="text" name="motherName" onChange={handleChange} required /></div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Birth Date</label><input type="date" name="dateOfBirth" onChange={handleChange} required /></div>
            <div className={styles.formGroup}>
              <label>Gender</label>
              <div className={styles.radioGroup}>
                <label><input type="radio" name="gender" value="MALE" checked={formData.gender === 'MALE'} onChange={handleChange}/> Male</label>
                <label><input type="radio" name="gender" value="FEMALE" checked={formData.gender === 'FEMALE'} onChange={handleChange}/> Female</label>
              </div>
            </div>
          </div>

          {/* Address Sections */}
          <fieldset className={styles.addressFieldset}>
            <legend>Present Address</legend>
            <div className={styles.formRow}>
              <div className={styles.formGroup}><label>Division</label><input type="text" name="presentAddressDivision" onChange={handleChange} /></div>
              <div className={styles.formGroup}><label>District</label><input type="text" name="presentAddressDistrict" onChange={handleChange} /></div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}><label>Address</label><input type="text" name="presentAddressDetails" onChange={handleChange} required /></div>
            </div>
          </fieldset>

          <fieldset className={styles.addressFieldset}>
            <legend>Permanent Address</legend>
            <div className={styles.formRow}>
              <div className={styles.formGroup}><label>Division</label><input type="text" name="permanentAddressDivision" onChange={handleChange} /></div>
              <div className={styles.formGroup}><label>District</label><input type="text" name="permanentAddressDistrict" onChange={handleChange} /></div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}><label>Address</label><input type="text" name="permanentAddressDetails" onChange={handleChange} /></div>
            </div>
          </fieldset>

          {/* Other Info */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Religion</label><input type="text" name="religion" onChange={handleChange} /></div>
            <div className={styles.formGroup}><label>Nationality</label><input type="text" name="nationality" value={formData.nationality} onChange={handleChange} /></div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Phone Number</label><input type="tel" name="phoneNumber" onChange={handleChange} required /></div>
            <div className={styles.formGroup}><label>Email Address</label><input type="email" name="email" onChange={handleChange} required /></div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>NID Number</label><input type="text" name="nidNumber" onChange={handleChange} /></div>
            <div className={styles.formGroup}><label>Blood Group</label><input type="text" name="bloodGroup" onChange={handleChange} /></div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Occupation</label><input type="text" name="occupation" onChange={handleChange} /></div>
            <div className={styles.formGroup}>
              <label>Status</label>
              <div className={styles.radioGroup}>
                <label><input type="radio" name="maritalStatus" value="SINGLE" checked={formData.maritalStatus === 'SINGLE'} onChange={handleChange}/> Single</label>
                <label><input type="radio" name="maritalStatus" value="MARRIED" checked={formData.maritalStatus === 'MARRIED'} onChange={handleChange}/> Married</label>
              </div>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Course Name</label>
              <select name="courseId" value={formData.courseId} onChange={handleChange} required>
                <option value="" disabled>-- Select a Course --</option>
                {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </div>
          </div>

          {/* -- Password Field (THIS BLOCK WAS ADDED) -- */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Temporary Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          {/* Declaration */}
          <div className={styles.declaration}>
            <h3>DECLARATION</h3>
            <p>I hereby, declaring that I will obey all the rules and regulations of the institution and be fully responsible for violating the rules.</p>
          </div>

          {/* Signatures */}
          <div className={styles.signatures}>
            <div className={styles.signatureBox}><label>Student's Signature</label></div>
            <div className={styles.signatureBox}><label>Authorized's Signature</label></div>
          </div>
        </div>
        
        {/* Submission & Footer */}
        <div className={styles.footer}>
          <div className={styles.submissionArea}>
            {message && <p className={styles.successMessage}>{message}</p>}
            {error && <p className={styles.errorMessage}>{error}</p>}
            <button type="submit" className={styles.submitButton}>Admit Student</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewAdmissionPage;