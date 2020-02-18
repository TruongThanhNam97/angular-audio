import numpy

start_second = 20

types = {
    1: numpy.int8,
    2: numpy.int16,
    4: numpy.int32
}

segment_len = 8192
delta_per_second = 0.04
alpha_per_second = 0.02

input_message = "Watermarked message khuong dang"

watermarked_folder = "watermarked2"
original_folder = "Original"