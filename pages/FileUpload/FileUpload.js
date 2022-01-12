import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactCrop from "react-image-crop";
import { useDropzone } from "react-dropzone";
import "react-image-crop/dist/ReactCrop.css";
import styled from 'styled-components';
const Title = styled.h1`
    font-weight:600;
    color:green;
`
const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
  justifyContent: "center",
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "2px solid black",
  marginBottom: 8,
  marginRight: 8,
  width: "300px",
  height: "100%",
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const img = {
  display: "block",
  width: "100%",
  height: "100%",
};
const FileUpload = (props) => {
  const [files, setFiles] = useState([]);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 55,
    aspect: 16 / 9,
    height: "auto",
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setFiles(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);
  function generateDownload(canvas, crop) {
    if (!crop || !canvas) {
      return;
    }

    canvas.toBlob(
      (blob) => {
        const previewUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.download = "cropPreview.png";
        anchor.href = URL.createObjectURL(blob);
        anchor.click();
        console.log(previewUrl);
        window.URL.revokeObjectURL(previewUrl);
      },
      "image/png",
      1
    );
  }
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });
  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name}>
      {/* <p>File Name:{file.name}</p> */}
      <div style={thumbInner}>
        {/* <img src={file.preview} style={img} /> */}
        <ReactCrop
          imageStyle={img}
          src={file.preview}
          onImageLoaded={onLoad}
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
        />
      </div>
    </div>
  ));
  const fileName = files.map((file) => (
    <div key={file.name}>
      <p>File Name : {file.name}</p>
      <p>File Size : {file.size}kb</p>
    </div>
  ));
  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
  }, [files, completedCrop]);
  return (
    <div>
      <Title style={{ textAlign: "center" }}>File Upload</Title>
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p
          style={{
            border: "1px dashed grey",
            padding: "10px",
            textAlign: "center",
          }}
        >
          Drag 'n' drop some files here, or click to select files
        </p>
      </div>
      <aside style={thumbsContainer}>{thumbs}</aside>
      <div style={{ textAlign: "center" }}>{fileName}</div>
      <div style={{ textAlign: "center" }}>
        <canvas
          ref={previewCanvasRef}
          // Rounding is important so the canvas width and height matches/is a multiple for sharpness.
          style={{
            width: Math.round(completedCrop?.width ?? 0),
            height: Math.round(completedCrop?.height ?? 0),
          }}
        />
      </div>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button
          type="button"
          style={{
            backgroundColor: "lightgrey",
            color: "black",
            padding: "15px",
            borderRadius: "12px",
            border: "2px solid black",
          }}
          disabled={!completedCrop?.width || !completedCrop?.height}
          onClick={() =>
            generateDownload(previewCanvasRef.current, completedCrop)
          }
        >
          Download cropped image
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
