# realtime_yolov8.py
# Realtime object detection with YOLOv8 + OpenCV
# Usage: python realtime_yolov8.py --source 0

import time
import argparse
import cv2
from ultralytics import YOLO
import numpy as np

def draw_boxes(frame, results, names, show_conf=True):
    """
    Draw boxes, class names and confidences on frame.
    results: ultralytics Results for a single frame
    names: model.names dict
    """
    if results is None:
        return frame
    boxes = results.boxes
    if boxes is None:
        return frame

    for box in boxes:
        # xyxy as tensor: [x1, y1, x2, y2]
        xyxy = box.xyxy[0].cpu().numpy().astype(int)
        conf = float(box.conf[0].cpu().numpy())
        cls = int(box.cls[0].cpu().numpy())
        label = names.get(cls, str(cls))

        x1, y1, x2, y2 = xyxy
        # box color depending on class
        color = tuple(int(c) for c in np.random.RandomState(cls).randint(0, 255, size=3))
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        text = f"{label} {conf:.2f}" if show_conf else label
        # text background
        (tw, th), baseline = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
        cv2.rectangle(frame, (x1, y1 - th - baseline - 6), (x1 + tw, y1), color, -1)
        cv2.putText(frame, text, (x1, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 1, cv2.LINE_AA)

    return frame

def draw_counts(frame, counts):
    """
    Draw per-class detection counts on frame.
    """
    if not counts:
        return frame

    line_height = 24
    x, y = 10, 55  # position below FPS readout
    for idx, (label, count) in enumerate(sorted(counts.items())):
        text = f"{label}: {count}"
        cv2.putText(
            frame,
            text,
            (x, y + idx * line_height),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 200, 255),
            2,
            cv2.LINE_AA,
        )
    return frame

def draw_warning(frame, message):
    """
    Draw a prominent warning message at the top of the frame.
    """
    if not message:
        return frame

    h, w = frame.shape[:2]
    (tw, th), baseline = cv2.getTextSize(message, cv2.FONT_HERSHEY_SIMPLEX, 0.9, 2)
    x = max(10, (w - tw) // 2)
    y = th + 20

    # Semi-transparent background to improve readability
    overlay = frame.copy()
    cv2.rectangle(overlay, (x - 12, y - th - baseline - 12), (x + tw + 12, y + baseline + 6), (0, 0, 255), -1)
    cv2.addWeighted(overlay, 0.35, frame, 0.65, 0, frame)

    cv2.putText(frame, message, (x, y), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2, cv2.LINE_AA)
    return frame

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=str, default="0", help="Camera index or video file path. Default 0")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="YOLOv8 model (yolov8n.pt/yolov8s.pt/...)")
    parser.add_argument("--device", type=str, default="cpu", help="Device: cpu or cuda or 'mps' (mac). For ARM use 'cpu' or gpu if available.")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold")
    parser.add_argument("--show_conf", action="store_true", help="Show confidence on label")
    args = parser.parse_args()

    # Parse camera source
    source = int(args.source) if args.source.isdigit() else args.source

    print("Loading model:", args.model, "device:", args.device)
    model = YOLO(args.model)  # loads default weights if path is model name
    model.fuse()  # optional: speed up inference on CPU/GPU
    # set model parameters for inference
    model.conf = args.conf  # confidence threshold
    # optionally set iou, max_det etc: model.iou = 0.45 ; model.max_det = 100

    # Open camera
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open source: {source}")

    # Optionally set resolution (modify as needed)
    # cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    # cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    prev_time = 0.0
    fps = 0.0

    print("Starting video stream. Press 'q' to quit.")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Empty frame, exiting")
            break

        # Convert BGR (OpenCV) to RGB for model
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Inference: We can pass numpy array directly. Use stream=False so we get a single Results
        # Use small models for real-time on CPU (yolov8n or yolov8s)
        results = model.predict(source=rgb, conf=args.conf, device=args.device, imgsz=640, verbose=False)

        # ultralytics predict returns a list-like; take first result
        result = results[0] if isinstance(results, (list, tuple)) else results

        # Count detections per class for this frame
        counts = {}
        if result is not None and result.boxes is not None and result.boxes.cls is not None:
            cls_ids = result.boxes.cls.cpu().numpy().astype(int)
            for cls_id in cls_ids:
                label = model.model.names.get(cls_id, str(cls_id))
                counts[label] = counts.get(label, 0) + 1

        # Draw boxes and counts
        frame = draw_boxes(frame, result, model.model.names, show_conf=args.show_conf)
        frame = draw_counts(frame, counts)

        # Show warning if a bottle is detected
        if counts.get("bottle"):
            frame = draw_warning(frame, "Warning: Retirar 'Bottle'")

        # Compute FPS
        curr_time = time.time()
        dt = curr_time - prev_time if prev_time else 0.0
        prev_time = curr_time
        fps = 1.0 / dt if dt > 0 else fps

        # Put FPS text
        cv2.putText(frame, f"FPS: {fps:.1f}", (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)

        # Show frame
        cv2.imshow("YOLOv8 Real-time", frame)

        # Quit
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()