import { useState } from 'react';
import Papa from 'papaparse';
import { intelligentConvert } from './utils/intelligentConverter';
import './App.css';

function App() {
  // Changed to array to support multiple files
  const [testFiles, setTestFiles] = useState([]);
  const [targetData, setTargetData] = useState(null);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [targetFileName, setTargetFileName] = useState('');
  const [conversionStats, setConversionStats] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const handleTestFileUpload = (files) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const newTestFiles = [];

    let parsedCount = 0;

    filesArray.forEach((file) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          newTestFiles.push({
            name: file.name,
            data: results.data
          });
          parsedCount++;

          // When all files are parsed, update state and convert
          if (parsedCount === filesArray.length) {
            const updatedFiles = [...testFiles, ...newTestFiles];
            setTestFiles(updatedFiles);
            // Auto-convert if we already have the target file
            performConversion(updatedFiles, targetData);
          }
        },
        error: (error) => {
          alert(`Error parsing ${file.name}: ${error.message}`);
          parsedCount++;
        }
      });
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
        // Auto-convert if we already have test files
        performConversion(testFiles, results.data);
      },
      error: (error) => {
        alert('Error parsing target CSV: ' + error.message);
      }
    });
  };

  const performConversion = (testFilesArray, target) => {
    if (!testFilesArray || testFilesArray.length === 0 || !target || target.length === 0) {
      // Both files are required for conversion
      setConvertedFiles([]);
      setConversionStats(null);
      return;
    }

    // Convert each test file
    const converted = testFilesArray.map(testFile => {
      const result = intelligentConvert(testFile.data, target);
      return {
        name: testFile.name,
        data: result.converted,
        stats: result.stats
      };
    });

    setConvertedFiles(converted);

    // Aggregate stats
    const totalStats = converted.reduce((acc, file) => ({
      totalRows: acc.totalRows + file.stats.totalRows,
      categorizedRows: acc.categorizedRows + file.stats.categorizedRows,
      uncategorizedRows: acc.uncategorizedRows + file.stats.uncategorizedRows,
      learnedMerchants: file.stats.learnedMerchants // Same for all
    }), { totalRows: 0, categorizedRows: 0, uncategorizedRows: 0, learnedMerchants: 0 });

    totalStats.categorizationRate = ((totalStats.categorizedRows / totalStats.totalRows) * 100).toFixed(1) + '%';
    setConversionStats(totalStats);
  };

  const handleTestFileInput = (e) => {
    const files = e.target.files;
    handleTestFileUpload(files);
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

    const files = e.dataTransfer.files;
    if (zone === 'test') {
      // Validate all files are CSV
      const allCSV = Array.from(files).every(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
      if (allCSV && files.length > 0) {
        handleTestFileUpload(files);
      } else {
        alert('Please upload CSV files only');
      }
    } else {
      const file = files[0];
      if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
        handleTargetFileUpload(file);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const downloadCSV = () => {
    if (!convertedFiles || convertedFiles.length === 0) return;

    convertedFiles.forEach(file => {
      const csv = Papa.unparse(file.data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Generate filename: converted-originalname.csv
      const originalName = file.name.replace(/\.csv$/i, '');
      a.download = `converted-${originalName}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const reset = () => {
    setTestFiles([]);
    setTargetData(null);
    setConvertedFiles([]);
    setTargetFileName('');
    setConversionStats(null);
    setCurrentPage(1);
  };

  const removeTestFile = (index) => {
    const newFiles = testFiles.filter((_, i) => i !== index);
    setTestFiles(newFiles);
    // Re-convert with remaining files
    if (newFiles.length > 0 && targetData) {
      performConversion(newFiles, targetData);
    } else {
      setConvertedFiles([]);
      setConversionStats(null);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Rogers to Monarch CSV Converter</h1>
        <p className="subtitle">Intelligent conversion that learns from your own data - no hardcoded rules!</p>
      </header>

      <main className="container">
        {convertedFiles.length === 0 ? (
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
                className={`upload-zone ${isDragging && activeDropZone === 'test' ? 'dragging' : ''} ${testFiles.length > 0 ? 'uploaded' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'test')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'test')}
              >
                <div className="upload-content">
                  {testFiles.length > 0 ? (
                    <>
                      <svg className="upload-icon success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <h3>Rogers CSV Uploaded ✓</h3>
                      <p className="file-stats">{testFiles.length} file{testFiles.length > 1 ? 's' : ''} uploaded</p>
                      <div className="file-list">
                        {testFiles.map((file, index) => (
                          <div key={index} className="file-item">
                            <span className="file-name-small">{file.name}</span>
                            <span className="file-count">({file.data.length} transactions)</span>
                            <button 
                              onClick={() => removeTestFile(index)}
                              className="remove-file-btn"
                              title="Remove file"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleTestFileInput}
                        id="test-file-upload-more"
                        className="file-input"
                        multiple
                      />
                      <label htmlFor="test-file-upload-more" className="upload-button secondary">
                        Add More Files
                      </label>
                    </>
                  ) : (
                    <>
                      <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <h3>Upload Rogers CSV</h3>
                      <p>Required - Your transaction export(s)</p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleTestFileInput}
                        id="test-file-upload"
                        className="file-input"
                        multiple
                      />
                      <label htmlFor="test-file-upload" className="upload-button">
                        Choose Files
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
                <p className="file-name">Source: {convertedFiles.length} file{convertedFiles.length > 1 ? 's' : ''}</p>
                {targetFileName && (
                  <p className="file-name">Reference: {targetFileName}</p>
                )}
                <p className="record-count">
                  {convertedFiles.reduce((sum, file) => sum + file.data.length, 0)} transactions converted
                </p>
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
                  Download Converted CSV{convertedFiles.length > 1 ? 's' : ''}
                </button>
                <button onClick={reset} className="reset-button">
                  Convert Another File
                </button>
              </div>
            </div>

            {convertedFiles.map((file, fileIndex) => {
              const allData = file.data;
              const totalPages = Math.ceil(allData.length / rowsPerPage);
              
              return (
                <div key={fileIndex} className="preview-section">
                  <h3>
                    {file.name} ({allData.length} transactions)
                    <span className="file-badge">
                      {file.stats.categorizedRows} categorized ({file.stats.categorizationRate})
                    </span>
                  </h3>

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
                        <option value={Math.max(allData.length, 1)}>All</option>
                      </select>
                    </div>
                    <div className="page-info">
                      Showing {Math.min((currentPage - 1) * rowsPerPage + 1, allData.length)} - {Math.min(currentPage * rowsPerPage, allData.length)} of {allData.length}
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
                        {allData
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
                      Page {currentPage} of {Math.max(1, totalPages)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="pagination-button"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage >= totalPages}
                      className="pagination-button"
                    >
                      Last
                    </button>
                  </div>
                </div>
              );
            })}
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
