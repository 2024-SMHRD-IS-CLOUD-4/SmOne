from typing import Any

import pandas as pd
import torch.utils.data as data


class BaseDataset(data.Dataset):
    '''
    Args:
    - root_dir: str, root directory of the dataset
    - split: str, 'train', 'val', or 'test'
    - annotation_file: str, path to the annotation csv file
    - transform: dict, dictionary of transforms        
    '''
    def __init__(self, root_dir:str, split:str, 
                 annotaion_file:str,
                 transform:dict[str, Any]=None):
        self.root_dir = root_dir
        assert split in ['train', 'val', 'test'], 'split should be either train, val, or test'
        self.split = split
        self.annoations = pd.read_csv(annotaion_file)
    
    def __getitem__(self, index:int):
        raise NotImplementedError
        
    def __len__(self):
        raise NotImplementedError