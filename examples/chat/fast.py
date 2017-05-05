
import sys
import numpy as np
import cv2
#from matplotlib import pyplot as plt

#
import json

# args
#print sys.argv

#https://www.tutorialspoint.com/python/python_command_line_arguments.htm
filename = sys.argv[1]

img = cv2.imread(filename, 0)

# Initiate FAST object with default values
fast = cv2.FastFeatureDetector_create()
# find and draw the keypoints
keypoints = fast.detect(img, None)
img2 = cv2.drawKeypoints(img, keypoints, None, color=(255,0,0))

# Print all default params
print "Threshold: ", fast.getThreshold()
print "nonmaxSuppression: ", fast.getNonmaxSuppression()
print "neighborhood: ", fast.getType()
print "Total Keypoints with nonmaxSuppression: ", len(keypoints)
cv2.imwrite('fast_true.png', img2)

# Disable nonmaxSuppression
# fast.setNonmaxSuppression(0)
# keypoints = fast.detect(img,None)
# print "Total Keypoints without nonmaxSuppression: ", len(keypoints)
# img3 = cv2.drawKeypoints(img, keypoints, None, color=(255,0,0))
# cv2.imwrite('fast_false.png',img3)

kps = []
for kp in keypoints:
    kps.append(kp.pt)
    # point = kp.pt
    # print point
    # print point[0]
    # print point[1]
    # result += "[%.1f, %.1f], " % ( kp.pt[0], kp.pt[1] )
# result += "] }'"

sys.stdout.write(json.dumps({'keypoints':kps}))
# sys.stdout.flush()
