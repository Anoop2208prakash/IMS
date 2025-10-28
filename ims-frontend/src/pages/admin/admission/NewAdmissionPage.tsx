import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../../assets/scss/pages/admin/admission/NewAdmissionPage.module.scss';
import logo from '../../../assets/image/logo.jpg'; // Make sure you have a logo file here

interface Program {
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
    nationality: 'Indian',
    phoneNumber: '',
    email: '',
    nidNumber: '',
    bloodGroup: '',
    occupation: '',
    maritalStatus: 'SINGLE',
    programId: '', // Changed from courseId
    password: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    // Fetch available programs for the dropdown
    const fetchPrograms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/programs');
        setPrograms(response.data);
      } catch (err) {
        toast.error('Failed to load programs.');
        console.error(err);
      }
    };
    fetchPrograms();
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

    if (!imageFile) {
      toast.error('Please upload a student photo.');
      return;
    }

    const submissionData = new FormData();
    
    // Append the uploaded image file
    submissionData.append('image', imageFile);

    // Append all other text fields from formData
    submissionData.append('fullName', formData.fullName);
    submissionData.append('fatherName', formData.fatherName);
    submissionData.append('motherName', formData.motherName);
    submissionData.append('dateOfBirth', formData.dateOfBirth);
    submissionData.append('gender', formData.gender);
    submissionData.append('presentAddress', `${formData.presentAddressDetails}, ${formData.presentAddressDistrict}, ${formData.presentAddressDivision}`);
    submissionData.append('permanentAddress', `${formData.permanentAddressDetails}, ${formData.permanentAddressDistrict}, ${formData.permanentAddressDivision}`);
    submissionData.append('religion', formData.religion);
    submissionData.append('nationality', formData.nationality);
    submissionData.append('phoneNumber', formData.phoneNumber);
    submissionData.append('email', formData.email);
    submissionData.append('nidNumber', formData.nidNumber);
    submissionData.append('bloodGroup', formData.bloodGroup);
    submissionData.append('occupation', formData.occupation);
    submissionData.append('maritalStatus', formData.maritalStatus);
    submissionData.append('programId', formData.programId);
    submissionData.append('password', formData.password);

    const promise = axios.post('http://localhost:5000/api/students', submissionData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    toast.promise(promise, {
      loading: 'Admitting student...',
      success: `Student "${formData.fullName}" admitted successfully!`,
      error: (err) => err.response?.data?.message || 'Failed to admit student.',
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <form onSubmit={handleSubmit} className={styles.admissionForm}>
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
                id="photoUpload" type="file" accept="image/png, image/jpeg" 
                onChange={handleImageChange} style={{ display: 'none' }}
              />
            </div>
          </div>
          <h2>ADMISSION FORM</h2>
        </div>

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

          <fieldset className={styles.addressFieldset}>
            <legend>Present Address</legend>
            <div className={styles.formRow}><div className={styles.formGroup}><label>Address</label><input type="text" name="presentAddressDetails" onChange={handleChange} required /></div></div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}><label>Division</label><input type="text" name="presentAddressDivision" onChange={handleChange} /></div>
              <div className={styles.formGroup}><label>District</label><input type="text" name="presentAddressDistrict" onChange={handleChange} /></div>
            </div>
          </fieldset>

          <fieldset className={styles.addressFieldset}>
            <legend>Permanent Address</legend>
            <div className={styles.formRow}><div className={styles.formGroup}><label>Address</label><input type="text" name="permanentAddressDetails" onChange={handleChange} /></div></div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}><label>Division</label><input type="text" name="permanentAddressDivision" onChange={handleChange} /></div>
              <div className={styles.formGroup}><label>District</label><input type="text" name="permanentAddressDistrict" onChange={handleChange} /></div>
            </div>
          </fieldset>
          
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
              <label>Program Name</label>
              <select name="programId" value={formData.programId} onChange={handleChange} required>
                <option value="" disabled>-- Select a Program --</option>
                {programs.map(program => <option key={program.id} value={program.id}>{program.title}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Temporary Password</label>
              <input type="password" name="password" onChange={handleChange} required />
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.declaration}>
            <h3>DECLARATION</h3>
            <p>I hereby, declaring that I will obey all the rules and regulations of the institution and be fully responsible for violating the rules.</p>
          </div>
          <div className={styles.signatures}>
            <div className={styles.signatureBox}><label>Student's Signature</label></div>
            <div className={styles.signatureBox}><label>Authorized's Signature</label></div>
          </div>
          <div className={styles.submissionArea}>
            <button type="submit" className={styles.submitButton}>Admit Student</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewAdmissionPage;