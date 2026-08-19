import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload, FileType, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function ExcelImportModal({ onClose }) {
  const { rooms, subjects, faculty, bulkCreateAllotments } = useApp();
  
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [validationResults, setValidationResults] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      parseFile(selected);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        setParsedData(jsonData);
        validateData(jsonData);
      } catch (err) {
        alert("Failed to parse Excel file. Please ensure it is a valid format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const validateData = (data) => {
    const results = {
      validRows: [],
      errors: []
    };

    data.forEach((row, index) => {
      const rowNum = index + 2; // +1 for 0-index, +1 for header
      const errors = [];
      
      // Helper to do case-insensitive matches
      const getMatch = (list, key, value) => 
        list.find(item => String(item[key]).toLowerCase() === String(value).toLowerCase());

      const rName = row['Room'] || row['Room Name'];
      const sName = row['Subject'] || row['Subject Name'];
      const fName = row['Faculty'] || row['Faculty Name'];
      const day = row['Day'];
      const startTime = row['Start Time'] || row['StartTime'];
      const endTime = row['End Time'] || row['EndTime'];
      const section = row['Section'] || '';

      const matchedRoom = getMatch(rooms, 'name', rName);
      const matchedSub = getMatch(subjects, 'name', sName);
      const matchedFac = getMatch(faculty, 'name', fName);

      if (!rName) errors.push('Missing Room column');
      else if (!matchedRoom) errors.push(`Room "${rName}" not found in database`);

      if (!sName) errors.push('Missing Subject column');
      else if (!matchedSub) errors.push(`Subject "${sName}" not found in database`);

      if (!fName) errors.push('Missing Faculty column');
      else if (!matchedFac) errors.push(`Faculty "${fName}" not found in database`);

      if (!day) errors.push('Missing Day column');
      if (!startTime) errors.push('Missing Start Time column');
      if (!endTime) errors.push('Missing End Time column');

      if (errors.length > 0) {
        results.errors.push({ rowNum, errors });
      } else {
        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime)) errors.push(`Invalid Start Time format (${startTime}). Use HH:MM`);
        if (!timeRegex.test(endTime)) errors.push(`Invalid End Time format (${endTime}). Use HH:MM`);
        
        if (errors.length > 0) {
          results.errors.push({ rowNum, errors });
        } else {
          results.validRows.push({
            roomId: matchedRoom.id,
            subjectId: matchedSub.id,
            facultyId: matchedFac.id,
            day: String(day).trim(),
            startTime: String(startTime).trim(),
            endTime: String(endTime).trim(),
            section: String(section).trim()
          });
        }
      }
    });

    setValidationResults(results);
  };

  const handleImport = async () => {
    if (!validationResults || validationResults.validRows.length === 0) return;
    
    setIsImporting(true);
    try {
      await bulkCreateAllotments(validationResults.validRows);
      onClose(); // Close modal on success
    } catch (e) {
      console.error(e);
      setIsImporting(false);
    }
  };

  return (
    <div className="modal-backdrop fade-in" onClick={onClose}>
      <div className="modal slide-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
        <div className="modal-header">
          <h2><Upload size={20} /> Bulk Import Allotments</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          
          {!file ? (
            <div 
              className="upload-dropzone" 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-body)',
                marginTop: '10px'
              }}
            >
              <FileType size={48} color="var(--primary)" style={{ marginBottom: '16px' }}/>
              <h3>Upload Excel File</h3>
              <p className="text-muted">Supports .xlsx and .csv</p>
              <p className="text-sm text-muted" style={{ marginTop: '10px' }}>
                Required Columns: Room, Subject, Faculty, Day, Start Time, End Time
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls, .csv" 
                style={{ display: 'none' }} 
              />
            </div>
          ) : (
            <div className="import-results">
              <div className="card" style={{ padding: '16px', marginBottom: '16px', background: 'var(--bg-body)' }}>
                <strong>Selected File:</strong> {file.name}
                <button 
                  className="btn btn-sm btn-secondary" 
                  onClick={() => { setFile(null); setValidationResults(null); }}
                  style={{ marginLeft: '10px' }}
                >
                  Change File
                </button>
              </div>

              {validationResults && (
                <>
                  <div className="stats-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div className="stat-card" style={{ flex: 1, padding: '12px', background: 'rgba(0, 212, 170, 0.1)', border: '1px solid var(--teal)', borderRadius: '8px' }}>
                      <CheckCircle2 color="var(--teal)" size={20} />
                      <div style={{ marginTop: '8px', fontWeight: 'bold' }}>{validationResults.validRows.length} Valid Rows</div>
                    </div>
                    <div className="stat-card" style={{ flex: 1, padding: '12px', background: 'rgba(255, 107, 107, 0.1)', border: '1px solid var(--rose)', borderRadius: '8px' }}>
                      <AlertTriangle color="var(--rose)" size={20} />
                      <div style={{ marginTop: '8px', fontWeight: 'bold' }}>{validationResults.errors.length} Errors</div>
                    </div>
                  </div>

                  {validationResults.errors.length > 0 && (
                    <div className="error-list" style={{ background: 'var(--bg-body)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <h4 style={{ color: 'var(--rose)', marginTop: 0 }}>Validation Errors</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
                        {validationResults.errors.slice(0, 5).map((err, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>
                            <strong>Row {err.rowNum}:</strong> {err.errors.join(', ')}
                          </li>
                        ))}
                      </ul>
                      {validationResults.errors.length > 5 && (
                        <p className="text-sm text-muted">...and {validationResults.errors.length - 5} more errors.</p>
                      )}
                      <p className="text-sm" style={{ marginTop: '10px' }}>
                        Rows with errors will be skipped during import.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isImporting}>Cancel</button>
          {validationResults && validationResults.validRows.length > 0 && (
            <button className="btn btn-primary" onClick={handleImport} disabled={isImporting}>
              {isImporting ? 'Importing...' : `Import ${validationResults.validRows.length} Records`}
              {!isImporting && <ArrowRight size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
