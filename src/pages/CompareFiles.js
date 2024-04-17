import React, { useState } from 'react';
import { Upload, Button, message, Modal, Input, Typography, Tabs } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TabPane } = Tabs;

const CompareFiles = () => {
  const [fileOne, setFileOne] = useState(null);
  const [fileTwo, setFileTwo] = useState(null);
  const [fileResults, setFileResults] = useState([]);
  const [downloadEnabled, setDownloadEnabled] = useState(false);

  const beforeUpload = (file) => {
    return false; // Prevent auto-upload
  };

  const handleCompare = async () => {
    if (!fileOne || !fileTwo) {
      Modal.error({
        title: 'Error',
        content: '请选择两个压缩包！',
      });
      return;
    }

    const formData = new FormData();
    formData.append('oriZip', fileOne);
    formData.append('tarZip', fileTwo);

    try {
      const response = await axios.post('http://localhost:8080/excel/compare', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFileResults(response.data);
      setDownloadEnabled(response.data.length > 0);
      message.success('文件比对完成');
    } catch (error) {
      console.error('Error during file comparison:', error);
      Modal.error({
        title: 'Error',
        content: '文件比对发生错误！',
      });
    }
  };

  const handleDownload = async (filePath) => {
    if (!filePath) return;
    filePath = filePath.replace('outputTxt/', 'outputZip/');
    filePath = filePath.substring(0, filePath.lastIndexOf('/'));
    filePath = filePath + '.zip';
    const formData = new FormData();
    formData.append('filePath', filePath);  // Use dynamic filePath from fileResult

    try {
      const response = await axios.post('http://localhost:8080/excel/compare/download', formData, {
        responseType: 'blob',  // This tells axios to handle the response as a Blob
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filePath.substring(filePath.lastIndexOf('/') + 1));
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      message.success('文件下载成功！');
    } catch (error) {
      console.error('Error during file download:', error);
      Modal.error({
        title: 'Error',
        content: '文件下载异常！',
      });
    }
  };

  return (
    <div>
      <Upload
        beforeUpload={beforeUpload}
        onChange={(info) => setFileOne(info.file)}
        fileList={fileOne ? [fileOne] : []}
      >
        <Button icon={<UploadOutlined />}>选择初始压缩包</Button>
      </Upload>
      <Upload
        beforeUpload={beforeUpload}
        onChange={(info) => setFileTwo(info.file)}
        fileList={fileTwo ? [fileTwo] : []}
      >
        <Button icon={<UploadOutlined />}>选择对比压缩包</Button>
      </Upload>
      <Button type="primary" onClick={handleCompare} style={{ marginTop: 20 }}>
        对比
      </Button>
      <Typography.Text strong style={{ display: 'block', marginTop: 20 }}>
        对比结果:
      </Typography.Text>
      <Tabs defaultActiveKey="0" style={{ marginTop: 20 }}>
        {fileResults.map((fileResult, index) => (
          <TabPane tab={fileResult.fileName} key={index}>
            <Input.TextArea value={fileResult.content} rows={10} readOnly />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(fileResult.filePath)}
              style={{ marginTop: 16 }}
            >
              下载对比结果
            </Button>
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default CompareFiles;
