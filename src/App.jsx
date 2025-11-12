import { useState } from 'react';
import Papa from 'papaparse';
import { intelligentConvert } from './utils/intelligentConverter';
import './App.css';

function App() {
  const [testData, setTestData] = useState(null);
  const [targetData, setTargetData] = useState(null);
  const [convertedData, setConvertedData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [targetFileName, setTargetFileName] = useState('');
  const [conversionStats, setConversionStats] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const handleTestFileUpload = (file) => {
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setTestData(results.data);
        // Auto-convert if we already have the test file
        performConversion(results.data, targetData);
      },
      error: (error) => {
        alert('Error parsing test CSV: ' + error.message);
      }
    });
  };

  const handleTargetFileUpload = (file) => {
    if (!file) return;

    setTargetFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setTargetData(results.data);
        // Auto-convert if we already have the test file
        performConversion(testData, results.data);
      },
      error: (error) => {
        alert('Error parsing target CSV: ' + error.message);
      }
    });
  };

  const performConversion = (test, target) => {
    if (!test || !target || target.length === 0) {
      // Both files are required for conversion
      setConvertedData(null);
      setConversionStats(null);
      return;
    }

    // Use intelligent conversion with target reference
    const result = intelligentConvert(test, target);
    setConvertedData(result.converted);
    setConversionStats(result.stats);
  };

  const handleTestFileInput = (e) => {
    const file = e.target.files[0];
    handleTestFileUpload(file);
  };

  const handleTargetFileInput = (e) => {
    const file = e.target.files[0];
    handleTargetFileUpload(file);
  };

  const handleDragOver = (e, zone) => {
    e.preventDefault();
    setIsDragging(true);
    setActiveDropZone(zone);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setActiveDropZone(null);
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    setIsDragging(false);
    setActiveDropZone(null);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      if (zone === 'test') {
        handleTestFileUpload(file);
      } else {
        handleTargetFileUpload(file);
      }
    } else {
      alert('Please upload a CSV file');
    }
  };

  const downloadCSV = () => {
    if (!convertedData) return;

    const csv = Papa.unparse(convertedData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'monarch-import.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const reset = () => {
    setTestData(null);
    setTargetData(null);
    setConvertedData(null);
    setFileName('');
    setTargetFileName('');
    setConversionStats(null);
    setCurrentPage(1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Rogers to Monarch CSV Converter</h1>
        <p className="subtitle">Intelligent conversion that learns from your own data - no hardcoded rules!</p>
      </header>

      <main className="container">
        {!convertedData ? (
          <>
            <div className="instructions">
              <h2>How It Works</h2>
              <div className="steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <div>
                    <h3>Upload Rogers Bank CSV (Required)</h3>
                    <p>Your Rogers credit card transaction csv export file with all transactions</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <div>
                    <h3>Upload Monarch CSV (Required)</h3>
                    <p>Your Monarch export with historical categorized transactions to learn from</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <div>
                    <h3>Get Smart Conversion</h3>
                    <p>App learns from your Monarch history and categorizes your Rogers transactions automatically</p>
                  </div>
                </div>
              </div>
              <div className="info-box">
                <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong>How It Works</strong>
                  <p>Upload your Rogers transactions and your Monarch Money export. The app learns merchant → category mappings from your Monarch history and applies them to categorize your Rogers transactions automatically.</p>
                </div>
              </div>
            </div>

            <div className="upload-grid">
              <div
                className={`upload-zone ${isDragging && activeDropZone === 'test' ? 'dragging' : ''} ${testData ? 'uploaded' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'test')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'test')}
              >
                <div className="upload-content">
                  {testData ? (
                    <>
                      <svg className="upload-icon success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <h3>Rogers CSV Uploaded ✓</h3>
                      <p className="file-name-small">{fileName}</p>
                      <p className="file-stats">{testData.length} transactions</p>
                    </>
                  ) : (
                    <>
                      <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <h3>Upload Rogers CSV</h3>
                      <p>Required - Your transaction export</p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleTestFileInput}
                        id="test-file-upload"
                        className="file-input"
                      />
                      <label htmlFor="test-file-upload" className="upload-button">
                        Choose File
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div
                className={`upload-zone ${isDragging && activeDropZone === 'target' ? 'dragging' : ''} ${targetData ? 'uploaded' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'target')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'target')}
              >
                <div className="upload-content">
                  {targetData ? (
                    <>
                      <svg className="upload-icon success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <h3>Target CSV Uploaded ✓</h3>
                      <p className="file-name-small">{targetFileName}</p>
                      <p className="file-stats">{targetData.length} reference transactions</p>
                    </>
                  ) : (
                    <>
                      <svg className="upload-icon optional" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3>Upload Monarch CSV</h3>
                      <p>Required - Your historical Monarch export</p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleTargetFileInput}
                        id="target-file-upload"
                        className="file-input"
                      />
                      <label htmlFor="target-file-upload" className="upload-button">
                        Choose File
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="results">
            <div className="results-header">
              <div>
                <h2>✅ Conversion Complete</h2>
                <p className="file-name">Source: {fileName}</p>
                {targetFileName && (
                  <p className="file-name">Reference: {targetFileName}</p>
                )}
                <p className="record-count">{convertedData.length} transactions converted</p>
                {conversionStats && (
                  <div className="stats-badges">
                    <span className="badge">
                      📊 {conversionStats.categorizationRate} categorized
                    </span>
                    <span className="badge">
                      🏷️ Learned from {conversionStats.learnedMerchants} merchants
                    </span>
                    <span className="badge">
                      ✅ {conversionStats.categorizedRows} / {conversionStats.totalRows} transactions
                    </span>
                  </div>
                )}
              </div>
              <div className="button-group">
                <button onClick={downloadCSV} className="download-button">
                  Download Converted CSV
                </button>
                <button onClick={reset} className="reset-button">
                  Convert Another File
                </button>
              </div>
            </div>

            <div className="preview-section">
              <h3>Preview ({convertedData.length} transactions)</h3>

              <div className="pagination-controls">
                <div className="rows-per-page">
                  <label>Rows per page: </label>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={Math.max(convertedData.length, 1)}>All</option>
                  </select>
                </div>
                <div className="page-info">
                  Showing {Math.min((currentPage - 1) * rowsPerPage + 1, convertedData.length)} - {Math.min(currentPage * rowsPerPage, convertedData.length)} of {convertedData.length}
                </div>
              </div>

              <div className="table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Merchant</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {convertedData
                      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                      .map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.Date}</td>
                          <td>{row.Merchant}</td>
                          <td>{row.Category}</td>
                          <td className={parseFloat(row.Amount) < 0 ? 'negative' : 'positive'}>
                            ${Math.abs(parseFloat(row.Amount)).toFixed(2)}
                          </td>
                          <td>{row.Owner}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="page-indicator">
                  Page {currentPage} of {Math.max(1, Math.ceil(convertedData.length / rowsPerPage))}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(convertedData.length / rowsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(convertedData.length / rowsPerPage)}
                  className="pagination-button"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(Math.ceil(convertedData.length / rowsPerPage))}
                  disabled={currentPage >= Math.ceil(convertedData.length / rowsPerPage)}
                  className="pagination-button"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Your data is processed entirely in your browser. Nothing is uploaded to any server.</p>
      </footer>
    </div>
  );
}

export default App;
